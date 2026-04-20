module nuansa_ship::crew {
    use std::string::{Self, String};
    use std::option;
    use std::vector;
    use initia_std::simple_nft;
    use initia_std::signer;

    // -- Friend declarations --------------------------------------------------
    friend nuansa_ship::battle;
    friend nuansa_ship::mint_starter;

    // -- Error codes ----------------------------------------------------------
    const E_INVALID_CLASS: u64          = 4;
    const E_CREW_INJURED: u64           = 10;
    const E_INVALID_INDEX: u64          = 11;

    // -- Role constants -------------------------------------------------------
    const ROLE_GUNNER: u8     = 0;
    const ROLE_NAVIGATOR: u8  = 1;
    const ROLE_ENGINEER: u8   = 2;

    // -- Status constants -----------------------------------------------------
    const STATUS_READY:   u8 = 0;
    const STATUS_INJURED: u8 = 1;
    const STATUS_KO:      u8 = 2;

    // -- Skill ID constants ---------------------------------------------------
    const SKILL_MULTI_SHOT:        u8 = 1; // Gunner
    const SKILL_EVASIVE_MANEUVER:  u8 = 2; // Navigator
    const SKILL_EMERGENCY_REPAIR:  u8 = 3; // Engineer

    // -- Fatigue thresholds ---------------------------------------------------
    const HP_INJURED_THRESHOLD: u8 = 50;
    const HP_KO_THRESHOLD:      u8 = 0;

    // -- Structs --------------------------------------------------------------

    /// Individual crew member data. Stored inside CrewRoster vector.
    struct CrewMember has store, drop, copy {
        role: u8,      // 0=Gunner 1=Navigator 2=Engineer
        skill_id: u8,
        morale: u8,    // 0-100
        hp: u8,        // 0-100
        status: u8,    // 0=Ready 1=Injured 2=KO
    }

    /// Roster of all crew members, stored at player address.
    struct CrewRoster has key {
        members: vector<CrewMember>,
    }

    // -- Internal mint - called by mint_starter.move --------------------------
    public(friend) fun mint_crew_internal(
        account: &signer,
        token_id: String,
        role: u8,
    ) acquires CrewRoster {
        assert!(role <= ROLE_ENGINEER, E_INVALID_CLASS);

        let creator = signer::address_of(account);

        simple_nft::mint(
            account,
            string::utf8(b"NSCR"),  // collection name
            string::utf8(b""),      // description
            token_id,               // unique token id
            string::utf8(b""),      // uri
            vector[],               // property_keys
            vector[],               // property_types
            vector[],               // property_values
            option::some(creator),  // recipient (mint to self)
        );

        let skill_id = default_skill_for_role(role);
        let member = CrewMember {
            role,
            skill_id,
            morale: 50,
            hp: 100,
            status: STATUS_READY,
        };

        // Create roster if it doesn't exist, otherwise append
        if (exists<CrewRoster>(creator)) {
            let roster = borrow_global_mut<CrewRoster>(creator);
            vector::push_back(&mut roster.members, member);
        } else {
            let members = vector::empty<CrewMember>();
            vector::push_back(&mut members, member);
            move_to(account, CrewRoster { members });
        };
    }

    // -- Fatigue resolution - called by battle.move after each wave -----------
    public(friend) fun resolve_fatigue(player: address, crew_index: u64) acquires CrewRoster {
        let roster = borrow_global_mut<CrewRoster>(player);
        let len = vector::length(&roster.members);
        assert!(crew_index < len, E_INVALID_INDEX);
        let member = vector::borrow_mut(&mut roster.members, crew_index);
        if (member.hp == HP_KO_THRESHOLD) {
            member.status = STATUS_KO;
        } else if (member.hp <= HP_INJURED_THRESHOLD) {
            member.status = STATUS_INJURED;
        } else {
            member.status = STATUS_READY;
        }
    }

    // -- Resolve fatigue for all crew members ---------------------------------
    public(friend) fun resolve_all_fatigue(player: address) acquires CrewRoster {
        let roster = borrow_global_mut<CrewRoster>(player);
        let len = vector::length(&roster.members);
        let i = 0u64;
        while (i < len) {
            let member = vector::borrow_mut(&mut roster.members, i);
            if (member.hp == HP_KO_THRESHOLD) {
                member.status = STATUS_KO;
            } else if (member.hp <= HP_INJURED_THRESHOLD) {
                member.status = STATUS_INJURED;
            } else {
                member.status = STATUS_READY;
            };
            i = i + 1;
        };
    }

    // -- Rest crew - called from port UI action -------------------------------
    public entry fun rest_crew(
        account: &signer,
        crew_index: u64,
    ) acquires CrewRoster {
        let player = signer::address_of(account);
        let roster = borrow_global_mut<CrewRoster>(player);
        let len = vector::length(&roster.members);
        assert!(crew_index < len, E_INVALID_INDEX);
        let member = vector::borrow_mut(&mut roster.members, crew_index);

        // KO crew cannot be healed by resting - requires Provisions item
        assert!(member.status != STATUS_KO, E_CREW_INJURED);

        // Only act if actually injured
        if (member.status == STATUS_INJURED) {
            member.hp = 100;
            member.status = STATUS_READY;
        }
    }

    // -- Read helpers (return values, not references) -------------------------
    public fun get_crew_count(player: address): u64 acquires CrewRoster {
        if (!exists<CrewRoster>(player)) {
            return 0
        };
        let roster = borrow_global<CrewRoster>(player);
        vector::length(&roster.members)
    }

    public fun get_member_role(player: address, index: u64): u8 acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).role
    }

    public fun get_member_hp(player: address, index: u64): u8 acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).hp
    }

    public fun get_member_status(player: address, index: u64): u8 acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).status
    }

    public fun get_member_morale(player: address, index: u64): u8 acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).morale
    }

    public fun get_member_skill(player: address, index: u64): u8 acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).skill_id
    }

    public fun is_member_ready(player: address, index: u64): bool acquires CrewRoster {
        let roster = borrow_global<CrewRoster>(player);
        vector::borrow(&roster.members, index).status == STATUS_READY
    }

    public fun has_roster(player: address): bool {
        exists<CrewRoster>(player)
    }

    // -- Pure helpers ---------------------------------------------------------
    fun default_skill_for_role(role: u8): u8 {
        if (role == ROLE_GUNNER)         { SKILL_MULTI_SHOT }
        else if (role == ROLE_NAVIGATOR) { SKILL_EVASIVE_MANEUVER }
        else                             { SKILL_EMERGENCY_REPAIR }
    }
}
