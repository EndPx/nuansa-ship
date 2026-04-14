module nuansa_ship::mint_starter {
    use std::string::{Self, String};
    use std::option;
    use std::vector;
    use initia_std::simple_nft;
    use initia_std::signer;
    use nuansa_ship::captain;
    use nuansa_ship::ship;
    use nuansa_ship::crew;
    use nuansa_ship::port;

    // ── Error codes ──────────────────────────────────────────────────────────
    const E_ALREADY_MINTED: u64 = 1;

    // ── Collection name constants ────────────────────────────────────────────
    const COLLECTION_CAPTAINS: vector<u8> = b"NSC";
    const COLLECTION_SHIPS:    vector<u8> = b"NSV";
    const COLLECTION_CREW:     vector<u8> = b"NSCR";

    // ── Structs ──────────────────────────────────────────────────────────────

    struct PlayerProfile has key {
        captain_token_id:  String,
        ship_token_id:     String,
        crew_token_ids:    vector<String>,
    }

    // ── Internal helper ──────────────────────────────────────────────────────

    fun concat_strings(base: &String, suffix: vector<u8>): String {
        let mut_bytes = *string::bytes(base);
        vector::append(&mut mut_bytes, suffix);
        string::utf8(mut_bytes)
    }

    // ── Entry: initialize_collections ────────────────────────────────────────

    public entry fun initialize_collections(account: &signer) {
        // Captains - "NSC"
        simple_nft::create_collection(
            account,
            string::utf8(b"Captains of Nuansa Ship"),
            option::none<u64>(),
            string::utf8(COLLECTION_CAPTAINS),
            string::utf8(b"https://nuansaship.xyz/captain"),
            true,   // mutable_description
            false,  // mutable_royalty
            true,   // mutable_uri
            true,   // mutable_nft_description
            true,   // mutable_nft_properties
            true,   // mutable_nft_uri
        );

        // Ships - "NSV"
        simple_nft::create_collection(
            account,
            string::utf8(b"Ships of Nuansa Ship"),
            option::none<u64>(),
            string::utf8(COLLECTION_SHIPS),
            string::utf8(b"https://nuansaship.xyz/ship"),
            true,
            false,
            true,
            true,
            true,
            true,
        );

        // Crew - "NSCR"
        simple_nft::create_collection(
            account,
            string::utf8(b"Crew of Nuansa Ship"),
            option::none<u64>(),
            string::utf8(COLLECTION_CREW),
            string::utf8(b"https://nuansaship.xyz/crew"),
            true,
            false,
            true,
            true,
            true,
            true,
        );
    }

    // ── Entry: mint_starter_pack ─────────────────────────────────────────────

    public entry fun mint_starter_pack(
        account:      &signer,
        captain_name: String,
    ) {
        let player = signer::address_of(account);
        assert!(!exists<PlayerProfile>(player), E_ALREADY_MINTED);

        // 1. Mint Captain NFT + CaptainStats at player address
        captain::mint_captain_internal(account, captain_name);

        // 2. Mint Corvette Ship NFT + ShipStats at player address
        let ship_id = concat_strings(&captain_name, b"_ship");
        ship::mint_ship_internal(account, ship_id, 0 /* Corvette */);

        // 3. Mint Gunner Crew NFT + add to CrewRoster at player address
        let crew_id = concat_strings(&captain_name, b"_crew");
        crew::mint_crew_internal(account, crew_id, 0 /* Gunner */);

        // 4. Initialise Port + Inventory (all buildings at level 0)
        port::init_port(account);

        // 5. Create PlayerProfile
        let crew_ids = vector::empty<String>();
        vector::push_back(&mut crew_ids, crew_id);

        move_to(account, PlayerProfile {
            captain_token_id: captain_name,
            ship_token_id:    ship_id,
            crew_token_ids:   crew_ids,
        });
    }

    // ── View: has_profile ────────────────────────────────────────────────────

    public fun has_profile(player: address): bool {
        exists<PlayerProfile>(player)
    }

    // ── View: get_profile ────────────────────────────────────────────────────

    public fun get_profile(player: address): (String, String) acquires PlayerProfile {
        let profile = borrow_global<PlayerProfile>(player);
        (profile.captain_token_id, profile.ship_token_id)
    }

    public fun get_crew_ids(player: address): vector<String> acquires PlayerProfile {
        borrow_global<PlayerProfile>(player).crew_token_ids
    }
}
