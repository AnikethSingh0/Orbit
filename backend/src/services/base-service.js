class BaseService {
    constructor(repository) {
        this.repository = repository;
    }
    async create(data) {
        try{
            const document = await this.repository.create(data);
            return document;
        }catch (error) {
            throw error;
        }
    }
    async delete(id) {
        try{
            const document = await this.repository.delete(id);
            return document;
        }catch (error) {
            throw error;
        }
    }

    async update(id, data) {
        try{
            const document = await this.repository.update(id, data);
            return document;
        }catch (error) {
            throw error;
        }
    }
    async findAll(offset = 0, limit = 10) {
        try{
            const documents = await this.repository.findAll(offset, limit);
            return documents;
        }catch (error) {
            throw error;
        }
    }
}

module.exports = BaseService;