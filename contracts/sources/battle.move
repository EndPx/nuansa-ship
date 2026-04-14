module nuansa_ship::battle {
    use std::vector;
    use initia_std::signer;
    use initia_std::block;
    use nuansa_ship::loot;
    use nuansa_ship::port;
    use nuansa_ship::captain;
    use nuansa_ship::ship;
    use nuansa_ship::crew;
    use nuansa_ship::mint_starter;

    // ── Error codes ──────────────────────────────────────────────────────────
    const E_NOT_OWNER: u64              = 3;
    const E_BATTLE_NOT_ACTIVE: u64      = 6;
    const E_NOT_PLAYER_TURN: u64        = 7;
    const E_BATTLE_ALREADY_EXISTS: u64  = 11;
    const E_BATTLE_NOT_WON: u64         = 12;
    const E_INVALID_MOVE_TYPE: u64      = 13;
    const E_OUT_OF_BOUNDS: u64          = 14;
    const E_NO_PROFILE: u64             = 15;

    // ── Turn constants ───────────────────────────────────────────────────────
    const TURN_PLAYER: u8 = 0;
    const TURN_ENEMY:  u8 = 1;

    // ── Status constants ─────────────────────────────────────────────────────
    const STATUS_ACTIVE: u8 = 0;
    const STATUS_WON:    u8 = 1;
    const STATUS_LOST:   u8 = 2;

    // ── Move type constants ──────────────────────────────────────────────────
    const MOVE_TYPE_MOVE:       u8 = 0;
    const MOVE_TYPE_ATTACK:     u8 = 1;
    const MOVE_TYPE_CREW_SKILL: u8 = 2;

    // ── Grid bounds ──────────────────────────────────────────────────────────
    const GRID_COLS: u8 = 10;
    const GRID_ROWS: u8 = 8;

    // ── XP rewards per wave tier ─────────────────────────────────────────────
    const XP_WAVE_EARLY: u64 = 100;   // waves 1-3
    const XP_WAVE_MID:   u64 = 200;   // waves 4-6
    const XP_WAVE_BOSS:  u64 = 500;   // waves 7+

    // ── Structs ──────────────────────────────────────────────────────────────

    struct Enemy has store, drop {
        hp:     u64,
        damage: u64,
        range:  u8,
        x:      u8,
        y:      u8,
        alive:  bool,
    }

    struct Battle has key {
        id:        u64,
        player:    address,
        wave:      u8,
        player_hp: u64,
        player_x:  u8,
        player_y:  u8,
        player_dmg: u64,
        player_range: u8,
        enemies:   vector<Enemy>,
        turn:      u8,   // 0=player 1=enemy
        status:    u8,   // 0=active 1=won 2=lost
    }

    struct BattleCounter has key {
        next_id: u64,
    }

    // ── Internal helpers ─────────────────────────────────────────────────────

    fun manhattan_dist(x1: u8, y1: u8, x2: u8, y2: u8): u8 {
        let dx = if (x1 >= x2) { x1 - x2 } else { x2 - x1 };
        let dy = if (y1 >= y2) { y1 - y2 } else { y2 - y1 };
        dx + dy
    }

    fun clamp_u8(v: u8, max_v: u8): u8 {
        if (v > max_v) { max_v } else { v }
    }

    fun build_enemies(wave: u8): vector<Enemy> {
        let enemies = vector::empty<Enemy>();
        if (wave <= 3) {
            vector::push_back(&mut enemies, Enemy {
                hp: 300, damage: 40, range: 2,
                x: 8, y: 4, alive: true,
            });
        } else if (wave <= 6) {
            vector::push_back(&mut enemies, Enemy {
                hp: 500, damage: 70, range: 3,
                x: 7, y: 3, alive: true,
            });
            vector::push_back(&mut enemies, Enemy {
                hp: 500, damage: 70, range: 3,
                x: 9, y: 5, alive: true,
            });
        } else {
            vector::push_back(&mut enemies, Enemy {
                hp: 2000, damage: 150, range: 4,
                x: 8, y: 4, alive: true,
            });
        };
        enemies
    }

    fun make_seed(nonce: u64): u64 {
        let (height, _timestamp) = block::get_block_info();
        height ^ (nonce * 2654435761u64)
    }

    fun step_toward(ex: u8, ey: u8, px: u8, py: u8): (u8, u8) {
        let dx = if (ex >= px) { ex - px } else { px - ex };
        let dy = if (ey >= py) { ey - py } else { py - ey };

        if (dx == 0 && dy == 0) {
            return (ex, ey)
        };

        if (dx >= dy) {
            if (ex > px) { (ex - 1, ey) }
            else         { (ex + 1, ey) }
        } else {
            if (ey > py) { (ex, ey - 1) }
            else         { (ex, ey + 1) }
        }
    }

    fun resolve_enemy_turn(battle: &mut Battle) {
        let seed = make_seed(battle.id);
        let player_x = battle.player_x;
        let player_y = battle.player_y;
        let len = vector::length(&battle.enemies);
        let i = 0u64;

        while (i < len) {
            let enemy = vector::borrow_mut(&mut battle.enemies, i);
            if (!enemy.alive) {
                i = i + 1;
                continue
            };

            // Move toward player if not already in range
            let dist = manhattan_dist(enemy.x, enemy.y, player_x, player_y);
            if (dist > enemy.range) {
                let (nx, ny) = step_toward(enemy.x, enemy.y, player_x, player_y);
                enemy.x = clamp_u8(nx, GRID_COLS - 1);
                enemy.y = clamp_u8(ny, GRID_ROWS - 1);
                // Recompute distance after move
                let new_dist = manhattan_dist(enemy.x, enemy.y, player_x, player_y);
                dist = new_dist;
            };

            // Attack if now in range
            if (dist <= enemy.range) {
                let dmg = enemy.damage;

                // Boss AoE: deals 1.5x damage when seed % 3 == 0
                if (battle.wave >= 7 && (seed % 3 == 0)) {
                    dmg = dmg + dmg / 2;
                };

                if (dmg >= battle.player_hp) {
                    battle.player_hp = 0;
                } else {
                    battle.player_hp = battle.player_hp - dmg;
                };
            };

            i = i + 1;
        };

        // Check if player is dead
        if (battle.player_hp == 0) {
            battle.status = STATUS_LOST;
        };

        // Hand turn back to player (if still active)
        if (battle.status == STATUS_ACTIVE) {
            battle.turn = TURN_PLAYER;
        };
    }

    fun check_win(battle: &mut Battle) {
        let len = vector::length(&battle.enemies);
        let i = 0u64;
        while (i < len) {
            let enemy = vector::borrow(&battle.enemies, i);
            if (enemy.alive) {
                return
            };
            i = i + 1;
        };
        battle.status = STATUS_WON;
    }

    // ── Public entry: start_battle ───────────────────────────────────────────

    public entry fun start_battle(account: &signer, wave: u8) acquires Battle, BattleCounter {
        let player = signer::address_of(account);

        // Must have a profile to battle
        assert!(mint_starter::has_profile(player), E_NO_PROFILE);

        // Ensure no existing active battle
        if (exists<Battle>(player)) {
            let existing = borrow_global<Battle>(player);
            assert!(existing.status != STATUS_ACTIVE, E_BATTLE_ALREADY_EXISTS);
            let Battle {
                id: _, player: _, wave: _, player_hp: _,
                player_x: _, player_y: _, player_dmg: _, player_range: _,
                enemies: _, turn: _, status: _,
            } = move_from<Battle>(player);
        };

        // Generate a unique battle ID
        let battle_id = if (exists<BattleCounter>(player)) {
            let counter = borrow_global_mut<BattleCounter>(player);
            let id = counter.next_id;
            counter.next_id = id + 1;
            id
        } else {
            move_to(account, BattleCounter { next_id: 1 });
            0u64
        };

        // Read player ship stats for battle
        let p_hull = ship::get_max_hull(player);
        let p_dmg = ship::get_weapon_damage(player);
        let p_range = ship::get_weapon_range(player);

        // Reset ship hull to max for the battle
        ship::reset_hull(player);

        let enemies = build_enemies(wave);

        move_to(account, Battle {
            id:          battle_id,
            player,
            wave,
            player_hp:   p_hull,
            player_x:    1,
            player_y:    4,
            player_dmg:  p_dmg,
            player_range: p_range,
            enemies,
            turn:   TURN_PLAYER,
            status: STATUS_ACTIVE,
        });
    }

    // ── Public entry: submit_move ────────────────────────────────────────────

    public entry fun submit_move(
        account:   &signer,
        move_type: u8,
        x:         u8,
        y:         u8,
    ) acquires Battle {
        let player = signer::address_of(account);
        assert!(exists<Battle>(player), E_BATTLE_NOT_ACTIVE);

        let battle = borrow_global_mut<Battle>(player);
        assert!(battle.status == STATUS_ACTIVE, E_BATTLE_NOT_ACTIVE);
        assert!(battle.turn   == TURN_PLAYER,   E_NOT_PLAYER_TURN);

        assert!(x < GRID_COLS, E_OUT_OF_BOUNDS);
        assert!(y < GRID_ROWS, E_OUT_OF_BOUNDS);

        if (move_type == MOVE_TYPE_MOVE) {
            battle.player_x = x;
            battle.player_y = y;

        } else if (move_type == MOVE_TYPE_ATTACK || move_type == MOVE_TYPE_CREW_SKILL) {
            let dist = manhattan_dist(battle.player_x, battle.player_y, x, y);
            assert!(dist <= battle.player_range, E_OUT_OF_BOUNDS);

            let attack_dmg = battle.player_dmg;
            let len = vector::length(&mut battle.enemies);
            let i = 0u64;
            while (i < len) {
                let enemy = vector::borrow_mut(&mut battle.enemies, i);
                if (enemy.alive && enemy.x == x && enemy.y == y) {
                    if (attack_dmg >= enemy.hp) {
                        enemy.hp    = 0;
                        enemy.alive = false;
                    } else {
                        enemy.hp = enemy.hp - attack_dmg;
                    };
                    break
                };
                i = i + 1;
            };

            check_win(battle);
        } else {
            assert!(false, E_INVALID_MOVE_TYPE);
        };

        // If battle is still active, hand turn to enemies
        if (battle.status == STATUS_ACTIVE) {
            battle.turn = TURN_ENEMY;
            resolve_enemy_turn(battle);
        };
    }

    // ── Public entry: claim_reward ───────────────────────────────────────────

    public entry fun claim_reward(account: &signer) acquires Battle {
        let player = signer::address_of(account);
        assert!(exists<Battle>(player), E_BATTLE_NOT_ACTIVE);

        let battle = borrow_global<Battle>(player);
        assert!(battle.status == STATUS_WON, E_BATTLE_NOT_WON);

        let wave = battle.wave;
        let battle_id = battle.id;

        // Drop loot into player inventory
        let seed = make_seed(battle_id);
        loot::distribute_loot(player, wave, seed);

        // Compute base XP for this wave tier
        let base_xp = if (wave <= 3) {
            XP_WAVE_EARLY
        } else if (wave <= 6) {
            XP_WAVE_MID
        } else {
            XP_WAVE_BOSS
        };

        // Scale XP by Admiral's Hall multiplier
        let xp_bps = port::get_xp_multiplier_bps(player);
        let xp = (base_xp * xp_bps) / 100;

        // Award XP to captain (stats stored at player address now)
        if (captain::has_captain_stats(player)) {
            captain::add_xp(player, xp);
        };

        // Resolve crew fatigue
        if (crew::has_roster(player)) {
            crew::resolve_all_fatigue(player);
        };

        // Remove the completed battle so player can start a new wave
        let Battle {
            id: _, player: _, wave: _, player_hp: _,
            player_x: _, player_y: _, player_dmg: _, player_range: _,
            enemies: _, turn: _, status: _,
        } = move_from<Battle>(player);
    }

    // ── View helpers ─────────────────────────────────────────────────────────

    public fun battle_status(player: address): u8 acquires Battle {
        borrow_global<Battle>(player).status
    }

    public fun player_hp(player: address): u64 acquires Battle {
        borrow_global<Battle>(player).player_hp
    }

    public fun current_turn(player: address): u8 acquires Battle {
        borrow_global<Battle>(player).turn
    }

    public fun has_active_battle(player: address): bool acquires Battle {
        if (!exists<Battle>(player)) { return false };
        borrow_global<Battle>(player).status == STATUS_ACTIVE
    }
}
