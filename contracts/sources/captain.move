module nuansa_ship::captain {
    use std::string::{Self, String};
    use std::option;
    use initia_std::simple_nft;
    use initia_std::signer;

    // -- Friend declarations --------------------------------------------------
    friend nuansa_ship::battle;
    friend nuansa_ship::mint_starter;

    // -- Error codes ----------------------------------------------------------
    const E_ALREADY_MINTED: u64      = 1;
    const E_NOT_OWNER: u64           = 3;

    // -- Constants -------------------------------------------------------------
    const COLLECTION_NAME: vector<u8> = b"NSC";
    const XP_PER_LEVEL: u64          = 1000;
    const MAX_LEVEL: u8               = 50;
    const MAX_STAT: u8                = 100;
    const STAT_PER_LEVEL: u8          = 5;

    // -- Resource (stored at player address) -----------------------------------
    struct CaptainStats has key {
        leadership: u8,       // 0-100, boosts crew morale passively
        tactics: u8,          // 0-100, unlocks special maneuvers
        special_skill_id: u8, // 0=none 1=Broadside 2=Evasive Drift
        xp: u64,
        level: u8,            // 1-50; level = xp / 1000
    }

    // -- Mint captain NFT + store CaptainStats at player address --------------
    public(friend) fun mint_captain_internal(account: &signer, token_id: String) {
        let creator = signer::address_of(account);

        simple_nft::mint(
            account,
            string::utf8(COLLECTION_NAME), // collection name
            string::utf8(b""),             // description
            token_id,                      // unique token id
            string::utf8(b""),             // uri
            vector[],                      // property_keys
            vector[],                      // property_types
            vector[],                      // property_values
            option::some(creator),         // recipient (mint to self)
        );

        // Store stats at the player's address directly
        move_to(account, CaptainStats {
            leadership: 50,
            tactics: 50,
            special_skill_id: 0,
            xp: 0,
            level: 1,
        });
    }

    // -- Add XP and handle level-ups -------------------------------------------
    public(friend) fun add_xp(player: address, amount: u64) acquires CaptainStats {
        let stats = borrow_global_mut<CaptainStats>(player);
        stats.xp = stats.xp + amount;

        // Process all pending level-ups
        loop {
            if (stats.level >= MAX_LEVEL) {
                break
            };
            let xp_needed = (stats.level as u64) * XP_PER_LEVEL;
            if (stats.xp < xp_needed) {
                break
            };
            stats.xp = stats.xp - xp_needed;
            stats.level = stats.level + 1;

            // leadership +5, capped at 100
            if (stats.leadership + STAT_PER_LEVEL >= MAX_STAT) {
                stats.leadership = MAX_STAT;
            } else {
                stats.leadership = stats.leadership + STAT_PER_LEVEL;
            };

            // tactics +5, capped at 100
            if (stats.tactics + STAT_PER_LEVEL >= MAX_STAT) {
                stats.tactics = MAX_STAT;
            } else {
                stats.tactics = stats.tactics + STAT_PER_LEVEL;
            };
        };
    }

    // -- Read-only stats accessor -----------------------------------------------
    // Returns: (leadership, tactics, special_skill_id, xp, level)
    public fun get_stats(player: address): (u8, u8, u8, u64, u8) acquires CaptainStats {
        let stats = borrow_global<CaptainStats>(player);
        (stats.leadership, stats.tactics, stats.special_skill_id, stats.xp, stats.level)
    }

    // -- Individual getters -----------------------------------------------------
    public fun get_leadership(player: address): u8 acquires CaptainStats {
        borrow_global<CaptainStats>(player).leadership
    }

    public fun get_level(player: address): u8 acquires CaptainStats {
        borrow_global<CaptainStats>(player).level
    }

    // -- Existence check --------------------------------------------------------
    public fun has_captain_stats(player: address): bool {
        exists<CaptainStats>(player)
    }
}
