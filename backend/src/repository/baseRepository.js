class BaseRepository {
    constructor(model) {
        this.model = model;
    }

    async create(data) {
        try {
            const document = await this.model.create(data);
            return document;
        } catch (error) {
            throw error;
        }
    }
   
    async findAll(offset, limit) {
        try {
            const documents = await this.model.find().skip(offset).limit(limit);
            return documents;
        } catch (error) {
            throw error;
        }
    }
    async update(id, data) {
        try {
            const document = await this.model.findByIdAndUpdate(id, data, { new: true });
            return document;
        } catch (error) {
            throw error;
        }
    }
    async delete(id) {
        try {
            const document = await this.model.findByIdAndDelete(id);
            return document;
        } catch (error) {
            throw error;
        }
    }
}
module.exports = BaseRepository;