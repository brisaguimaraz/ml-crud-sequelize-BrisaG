/* base de datos */

const db = require('../database/models')

const { privateDecrypt } = require('crypto');
const fs = require('fs');
const path = require('path');
const { unlinkSync,existsSync } = require('fs');
const { log } = require('console');

const productsFilePath = path.join(__dirname, '../data/productsDataBase.json');
const products = JSON.parse(fs.readFileSync(productsFilePath, 'utf-8'));

const toThousand = n => n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");

const controller = {
	// Root - Show all products
	index: (req, res) => {

		db.Product.findAll()
		.then(products => {
			return res.render('products', {
				products, 
				toThousand
			})
		})
		.catch(error => console.log(error))
		
	},
	

	// Detail - Detail from one product
	detail: (req, res) => {

		db.Product.findByPk(req.params.id)
		.then(product => {
			return res.render('detail', {
				...product.dataValues,
				toThousand
			})
		})
		.catch(error => console.log(error))
		
	},

	// Create - Form to create
	create: (req, res) => {

		return res.render('product-create-form')
	},
	
	// Create -  Method to store
	store: (req, res) => {
		
		const { name, price, discount, description, category} = req.body;

		let newProduct = {
			id : products[products.length - 1].id + 1,
			name : name.trim(),
			price : +price,
			discount : +discount,
			category, 
			description : description.trim(),
			image : req.file ? req.file.filename : null
		}

		products.push(newProduct)

		fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 3), 'utf-8')

		return res.redirect('/products')
	},

	// Update - Form to edit
	edit: (req, res) => {

		const product = products.find(product => product.id === +req.params.id);
		res.render('product-edit-form', {
			...product
		})
	},
	// Update - Method to update
	update: (req, res) => {
		const { name, price, discount, description, category} = req.body;

		const updatedProducts = products.map(product => {

			if(product.id === +req.params.id) {
			req.file && (existsSync(`./public/images/products/${product.image}`) && unlinkSync(`./public/images/products/${product.image}`));
			product.name = name.trim();
			product.price = +price;
			product.discount = +discount;
			product.category = category; 
			product.description = description.trim();
			product.image = req.file ? req.file.filename : product.image
			}
			
			return product

		})

		fs.writeFileSync(productsFilePath, JSON.stringify(products, null, 3), 'utf-8')

		return res.redirect('/products')
	},

	// Delete - Delete one product from DB
	destroy : (req, res) => {
		
		const modifiedProducts = products.filter(product => product.id !== +req.params.id);

		fs.writeFileSync(
			productsFilePath,
			JSON.stringify(modifiedProducts, null, 3),
			'utf-8'
			);

		return res.redirect('/products')
	}
};

module.exports = controller;