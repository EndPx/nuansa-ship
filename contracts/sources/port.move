module nuansa_ship::port {
    use initia_std::signer;
    use std::vector;

    // ── Friend declarations ──────────────────────────────────────────────────
    friend nuansa_ship::battle;
    friend nuansa_ship::mint_starter;
    friend nuansa_ship::loot;

    // ── Error codes ──────────────────────────────────────────────────────────
    const E_INSUFFICIENT_MATERIALS: u64 = 8;
    const E_BUILDING_MAX_LEVEL: u64     = 9;
    const E_NOT_OWNER: u64              = 3;
    const E_INVALID_BUILDING: u64       = 12;

    // ── Building type constants ──────────────────────────────────────────────
    const BUILDING_SHIPYARD:       u8 = 0;
    const BUILDING_ARMORY:         u8 = 1;
    const BUILDING_BARRACKS:       u8 = 2;
    const BUILDING_ADMIRALS_HALL:  u8 = 3;
    const BUILDING_WAREHOUSE:      u8 = 4;

    // ── Item type constants ──────────────────────────────────────────────────
    const ITEM_IRON_PLANKS:    u8 = 0;
    const ITEM_STEEL_PARTS:    u8 = 1;
    const ITEM_PROVISIONS:     u8 = 2;
    const ITEM_COMMANDER_TOME: u8 = 3;
    const ITEM_TIMBER:         u8 = 4;

    // ── Max building level ───────────────────────────────────────────────────
    const MAX_LEVEL: u8 = 5;

    // ── Structs ──────────────────────────────────────────────────────────────

    struct Item has store, drop {
        item_type: u8,
        amount: u64,
    }

    struct Port has key {
        owner: address,
        shipyard_level: u8,
        armory_level: u8,
        barracks_level: u8,
        admirals_hall_level: u8,
        warehouse_level: u8,
    }

    struct Inventory has key {
        items: vector<Item>,
    }

    // ── Public initializer (called from mint_starter_pack) ───────────────────
    public(friend) fun init_port(account: &signer) {
        let owner = signer::address_of(account);
        move_to(account, Port {
            owner,
            shipyard_level: 0,
            armory_level: 0,
            barracks_level: 0,
            admirals_hall_level: 0,
            warehouse_level: 0,
        });
        move_to(account, Inventory {
            items: vector::empty<Item>(),
        });
    }

    // ── Entry: upgrade a building ────────────────────────────────────────────
    public entry fun upgrade_building(account: &signer, building_type: u8) acquires Port, Inventory {
        let player = signer::address_of(account);
        let port = borrow_global_mut<Port>(player);
        assert!(port.owner == player, E_NOT_OWNER);

        if (building_type == BUILDING_SHIPYARD) {
            let current = port.shipyard_level;
            assert!(current < MAX_LEVEL, E_BUILDING_MAX_LEVEL);
            let new_level = current + 1;
            let cost = (new_level as u64) * 3;
            deduct_item(player, ITEM_IRON_PLANKS, cost);
            port.shipyard_level = new_level;

        } else if (building_type == BUILDING_ARMORY) {
            let current = port.armory_level;
            assert!(current < MAX_LEVEL, E_BUILDING_MAX_LEVEL);
            let new_level = current + 1;
            let cost = (new_level as u64) * 2;
            deduct_item(player, ITEM_STEEL_PARTS, cost);
            port.armory_level = new_level;

        } else if (building_type == BUILDING_BARRACKS) {
            let current = port.barracks_level;
            assert!(current < MAX_LEVEL, E_BUILDING_MAX_LEVEL);
            let new_level = current + 1;
            let cost = (new_level as u64) * 3;
            deduct_item(player, ITEM_PROVISIONS, cost);
            port.barracks_level = new_level;

        } else if (building_type == BUILDING_ADMIRALS_HALL) {
            let current = port.admirals_hall_level;
            assert!(current < MAX_LEVEL, E_BUILDING_MAX_LEVEL);
            let new_level = current + 1;
            let cost = (new_level as u64) * 1;
            deduct_item(player, ITEM_COMMANDER_TOME, cost);
            port.admirals_hall_level = new_level;

        } else if (building_type == BUILDING_WAREHOUSE) {
            let current = port.warehouse_level;
            assert!(current < MAX_LEVEL, E_BUILDING_MAX_LEVEL);
            let new_level = current + 1;
            let cost = (new_level as u64) * 4;
            deduct_item(player, ITEM_TIMBER, cost);
            port.warehouse_level = new_level;

        } else {
            assert!(false, E_INVALID_BUILDING);
        }
    }

    // ── Inventory helpers ────────────────────────────────────────────────────
    public(friend) fun add_item(account_addr: address, item_type: u8, amount: u64) acquires Inventory {
        let inv = borrow_global_mut<Inventory>(account_addr);
        let len = vector::length(&inv.items);
        let i = 0u64;
        while (i < len) {
            let item = vector::borrow_mut(&mut inv.items, i);
            if (item.item_type == item_type) {
                item.amount = item.amount + amount;
                return
            };
            i = i + 1;
        };
        vector::push_back(&mut inv.items, Item { item_type, amount });
    }

    public fun has_item(account_addr: address, item_type: u8, amount: u64): bool acquires Inventory {
        let inv = borrow_global<Inventory>(account_addr);
        let len = vector::length(&inv.items);
        let i = 0u64;
        while (i < len) {
            let item = vector::borrow(&inv.items, i);
            if (item.item_type == item_type) {
                return item.amount >= amount
            };
            i = i + 1;
        };
        false
    }

    fun deduct_item(account_addr: address, item_type: u8, amount: u64) acquires Inventory {
        let inv = borrow_global_mut<Inventory>(account_addr);
        let len = vector::length(&inv.items);
        let i = 0u64;
        while (i < len) {
            let item = vector::borrow_mut(&mut inv.items, i);
            if (item.item_type == item_type) {
                assert!(item.amount >= amount, E_INSUFFICIENT_MATERIALS);
                item.amount = item.amount - amount;
                return
            };
            i = i + 1;
        };
        assert!(false, E_INSUFFICIENT_MATERIALS);
    }

    // ── Getter helpers ───────────────────────────────────────────────────────
    public fun get_shipyard_level(addr: address): u8 acquires Port {
        borrow_global<Port>(addr).shipyard_level
    }

    public fun get_armory_level(addr: address): u8 acquires Port {
        borrow_global<Port>(addr).armory_level
    }

    public fun get_barracks_level(addr: address): u8 acquires Port {
        borrow_global<Port>(addr).barracks_level
    }

    public fun get_admirals_hall_level(addr: address): u8 acquires Port {
        borrow_global<Port>(addr).admirals_hall_level
    }

    public fun get_warehouse_level(addr: address): u8 acquires Port {
        borrow_global<Port>(addr).warehouse_level
    }

    /// XP multiplier scaled x100 to avoid floats.
    /// lv0=100, lv1=125, lv2=150, lv3=175, lv4+=200
    public fun get_xp_multiplier_bps(addr: address): u64 acquires Port {
        let lv = borrow_global<Port>(addr).admirals_hall_level;
        if (lv == 0)      { 100 }
        else if (lv == 1) { 125 }
        else if (lv == 2) { 150 }
        else if (lv == 3) { 175 }
        else              { 200 }
    }

    /// Max crew slots based on barracks level.
    /// lv0-1=1, lv2-3=2, lv4+=3
    public fun get_max_crew_slots(addr: address): u8 acquires Port {
        let lv = borrow_global<Port>(addr).barracks_level;
        if (lv < 2)      { 1 }
        else if (lv < 4) { 2 }
        else             { 3 }
    }

    /// Max inventory size based on warehouse level: 10 + (level x 5)
    public fun get_inventory_max(addr: address): u64 acquires Port {
        let lv = borrow_global<Port>(addr).warehouse_level;
        10 + ((lv as u64) * 5)
    }
}
