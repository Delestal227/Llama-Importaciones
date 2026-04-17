const recordPriceChange = async (client, { productId, oldPrice, newPrice, changedBy }) => {
    if (oldPrice === null || oldPrice === undefined) return;
    if (Number(oldPrice) === Number(newPrice)) return;
    await client.query(
        `INSERT INTO price_history (product_id, old_price, new_price, changed_by)
         VALUES ($1, $2, $3, $4)`,
        [productId, oldPrice, newPrice, changedBy || null]
    );
};

const recordInventoryMovement = async (client, {
    productId, movementType, quantity, stockBefore, stockAfter,
    referenceId = null, referenceType = null, notes = null, createdBy = null,
}) => {
    await client.query(
        `INSERT INTO inventory_movements
         (product_id, movement_type, quantity, stock_before, stock_after,
          reference_id, reference_type, notes, created_by)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)`,
        [productId, movementType, quantity, stockBefore, stockAfter,
         referenceId, referenceType, notes, createdBy]
    );
};

module.exports = { recordPriceChange, recordInventoryMovement };
