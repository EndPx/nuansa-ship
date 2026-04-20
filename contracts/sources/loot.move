module nuansa_ship::loot {
    use nuansa_ship::port;

    // -- Friend declarations --------------------------------------------------
    friend nuansa_ship::battle;

    // -- Item type constants (mirrors port.move) ------------------------------
    const ITEM_IRON_PLANKS:    u8 = 0;
    const ITEM_STEEL_PARTS:    u8 = 1;
    const ITEM_PROVISIONS:     u8 = 2;
    const ITEM_COMMANDER_TOME: u8 = 3;
    const ITEM_TIMBER:         u8 = 4;

    // -- Drop table -----------------------------------------------------------
    //
    // Wave 1-3:  50% IronPlanks x2,  50% Provisions x2
    // Wave 4-6:  30% IronPlanks x3,  30% Provisions x3,  30% SteelParts x2, 10% Timber x2
    // Wave 7+:   25% SteelParts x3,  25% Timber x3,      25% CommanderTome x1, 25% SteelParts x5
    //
    // Returns (item_type, amount).

    public(friend) fun roll_loot(wave: u8, seed: u64): (u8, u64) {
        let roll = ((seed % 100) as u8);

        if (wave <= 3) {
            if (roll < 50) {
                (ITEM_IRON_PLANKS, 2)
            } else {
                (ITEM_PROVISIONS, 2)
            }
        } else if (wave <= 6) {
            if (roll < 30) {
                (ITEM_IRON_PLANKS, 3)
            } else if (roll < 60) {
                (ITEM_PROVISIONS, 3)
            } else if (roll < 90) {
                (ITEM_STEEL_PARTS, 2)
            } else {
                (ITEM_TIMBER, 2)
            }
        } else {
            if (roll < 25) {
                (ITEM_STEEL_PARTS, 3)
            } else if (roll < 50) {
                (ITEM_TIMBER, 3)
            } else if (roll < 75) {
                (ITEM_COMMANDER_TOME, 1)
            } else {
                (ITEM_STEEL_PARTS, 5)
            }
        }
    }

    // -- Distribute loot into player's port inventory -------------------------
    public(friend) fun distribute_loot(player: address, wave: u8, seed: u64) {
        let (item_type, amount) = roll_loot(wave, seed);
        port::add_item(player, item_type, amount);
    }
}
