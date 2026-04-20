module nuansa_ship::ship {
    use std::string::{Self, String};
    use std::option;
    use std::vector;
    use initia_std::simple_nft;
    use initia_std::signer;

    // -- Friend declarations --------------------------------------------------
    friend nuansa_ship::battle;
    friend nuansa_ship::mint_starter;

    // -- Error codes ----------------------------------------------------------
    const E_CREW_FULL: u64              = 2;
    const E_INVALID_CLASS: u64          = 4;

    // -- Ship class constants -------------------------------------------------
    const SHIP_CLASS_CORVETTE:    u8 = 0;
    const SHIP_CLASS_FRIGATE:     u8 = 1;
    const SHIP_CLASS_DESTROYER:   u8 = 2;
    const SHIP_CLASS_BATTLESHIP:  u8 = 3;

    // -- ShipStats resource (stored at player address) ------------------------
    struct ShipStats has key {
        ship_class:       u8,
        hull:             u64,
        max_hull:         u64,
        engine:           u8,
        weapon_damage:    u64,
        weapon_range:     u8,
        armor:            u8,
        captain_token_id: String,         // empty string = no captain equipped
        crew_token_ids:   vector<String>,  // max 3
    }

    // -- Internal helpers: base stats per ship class --------------------------
    fun base_stats(ship_class: u8): (u64, u8, u64, u8, u8) {
        // returns (max_hull, engine, weapon_damage, weapon_range, armor)
        assert!(ship_class <= SHIP_CLASS_BATTLESHIP, E_INVALID_CLASS);

        if (ship_class == SHIP_CLASS_CORVETTE) {
            (500, 4, 60, 2, 5)
        } else if (ship_class == SHIP_CLASS_FRIGATE) {
            (800, 3, 90, 3, 15)
        } else if (ship_class == SHIP_CLASS_DESTROYER) {
            (1200, 2, 130, 4, 25)
        } else {
            // SHIP_CLASS_BATTLESHIP
            (2000, 1, 180, 5, 40)
        }
    }

    // -- Mint ship NFT + store ShipStats at player address --------------------
    public(friend) fun mint_ship_internal(
        account:    &signer,
        token_id:   String,
        ship_class: u8,
    ) {
        let creator = signer::address_of(account);

        // Mint NFT into "NSV" collection
        simple_nft::mint(
            account,
            string::utf8(b"NSV"),   // collection name
            string::utf8(b""),      // description
            token_id,               // unique token id
            string::utf8(b""),      // uri
            vector[],               // property_keys
            vector[],               // property_types
            vector[],               // property_values
            option::some(creator),  // recipient (mint to self)
        );

        let (max_hull, engine, weapon_damage, weapon_range, armor) = base_stats(ship_class);

        // Store stats at the player's address directly
        move_to(account, ShipStats {
            ship_class,
            hull: max_hull,
            max_hull,
            engine,
            weapon_damage,
            weapon_range,
            armor,
            captain_token_id: string::utf8(b""),
            crew_token_ids:   vector::empty<String>(),
        });
    }

    // -- Equip captain to ship ------------------------------------------------
    public entry fun equip_captain(
        account:          &signer,
        captain_token_id: String,
    ) acquires ShipStats {
        let player = signer::address_of(account);
        let stats = borrow_global_mut<ShipStats>(player);
        stats.captain_token_id = captain_token_id;
    }

    // -- Equip crew to ship ---------------------------------------------------
    public entry fun equip_crew(
        account:       &signer,
        crew_token_id: String,
    ) acquires ShipStats {
        let player = signer::address_of(account);
        let stats = borrow_global_mut<ShipStats>(player);
        assert!(vector::length(&stats.crew_token_ids) < 3, E_CREW_FULL);
        vector::push_back(&mut stats.crew_token_ids, crew_token_id);
    }

    // -- Take damage ----------------------------------------------------------
    public(friend) fun take_damage(player: address, damage: u64) acquires ShipStats {
        let stats = borrow_global_mut<ShipStats>(player);
        if (damage >= stats.hull) {
            stats.hull = 0;
        } else {
            stats.hull = stats.hull - damage;
        }
    }

    // -- Reset hull to max (for battle start) ---------------------------------
    public(friend) fun reset_hull(player: address) acquires ShipStats {
        let stats = borrow_global_mut<ShipStats>(player);
        stats.hull = stats.max_hull;
    }

    // -- Accessor helpers (read-only, return values not references) ------------
    public fun get_ship_class(player: address): u8 acquires ShipStats {
        borrow_global<ShipStats>(player).ship_class
    }

    public fun get_hull(player: address): u64 acquires ShipStats {
        borrow_global<ShipStats>(player).hull
    }

    public fun get_max_hull(player: address): u64 acquires ShipStats {
        borrow_global<ShipStats>(player).max_hull
    }

    public fun get_engine(player: address): u8 acquires ShipStats {
        borrow_global<ShipStats>(player).engine
    }

    public fun get_weapon_damage(player: address): u64 acquires ShipStats {
        borrow_global<ShipStats>(player).weapon_damage
    }

    public fun get_weapon_range(player: address): u8 acquires ShipStats {
        borrow_global<ShipStats>(player).weapon_range
    }

    public fun get_armor(player: address): u8 acquires ShipStats {
        borrow_global<ShipStats>(player).armor
    }

    public fun get_captain_token_id(player: address): String acquires ShipStats {
        borrow_global<ShipStats>(player).captain_token_id
    }

    public fun get_crew_token_ids(player: address): vector<String> acquires ShipStats {
        borrow_global<ShipStats>(player).crew_token_ids
    }

    public fun has_ship_stats(player: address): bool {
        exists<ShipStats>(player)
    }
}
