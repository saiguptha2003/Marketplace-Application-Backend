const Airtable = require('airtable');
const { v4: uuidv4 } = require('uuid');

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY }).base(process.env.AIRTABLE_BASE_ID);

class Order {
    constructor(productId, userId, status = 'ordered') {
        this.orderId = uuidv4();
        this.productId = productId;
        this.userId = userId;
        this.status = status;
    }

    async save() {
        const record = await base('orders').create([
            {
                fields: {
                    orderId: this.orderId,
                    productId: this.productId,
                    userId: this.userId,
                    status: this.status,
                },
            },
        ]);
        return record;
    }
    static async findAll() {
        const records = await base('orders').select().all();
        return records.map(record => ({ id: record.id, ...record.fields }));
    }
    static async findById(orderId) {
        const record = await base('orders').find(orderId);
        return { id: record.id, ...record.fields };
    }
    static async update(orderId, updatedFields) {
        const record = await base('orders').select({
            filterByFormula: `{orderId} = '${orderId}'`
        }).firstPage();

        if (record.length === 0) {
            throw new Error('Order not found');
        }

        const updatedRecord = await base('orders').update(record[0].id, {
            fields: updatedFields,
        });
        return { id: updatedRecord.id, ...updatedRecord.fields };
    }
    static async delete(orderId) {
        const records = await base('orders').select({
            filterByFormula: `{orderId} = '${orderId}'`
        }).firstPage();

        if (records.length === 0) {
            throw new Error('Order not found');
        }

        await base('orders').destroy(records[0].id);
        return { orderId };
    }
    static async findByOrderId(orderId) {
        const records = await base('orders').select({
            filterByFormula: `{orderId} = '${orderId}'` // Use Airtable's formula to filter by productId
        }).firstPage();

        if (records.length > 0) {
            return { id: records[0].id, ...records[0].fields }; // Return the first matching product
        } else {
            return null; // Return null if no product is found
        }
    }
}

module.exports = Order; 