

module.exports = class ProductModel { 
    /**
     * Create a new product using data object with the following properties: 
     * @param {number} category_id
     * @param {string} name
     * @param {string} description
     * @param {string} color
     * @param {number} stem_length_cm
     * @param {number} bloom_size_cm
     * @param {number} blooms_per_stem
     * @param {number} life_in_days
     * @param {number} qty_per_case
     * @param {string} measure_per_case
     * @param {number} price_per_case
     * @param {Array} images_url
     * @param {string} created_at
     * @param {string} updated_at
     * @returns {Object}
     * @throws {Error}
     */
    constructor(data) {
        this.category_id = data.category_id;
        this.name = data.name;
        this.description = data.description;
        this.color = data.color;
        this.stem_length_cm = data.stem_length_cm;
        this.bloom_size_cm = data.bloom_size_cm;
        this.blooms_per_stem = data.blooms_per_stem;
        this.life_in_days = data.life_in_days;
        this.qty_per_case = data.qty_per_case;
        this.measure_per_case = data.measure_per_case;
        this.price_per_case = data.price_per_case;
        this.images_url = data.images_url || [];
        this.created_at = new Date().toISOString();
        this.updated_at = new Date().toISOString();        
    }
}