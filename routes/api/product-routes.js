const router = require('express').Router();
const { Product, Category, Tag, ProductTag } = require('../../models');

// The `/api/products` endpoint

// get all products
router.get('/', async (req, res) => {
  // find all products
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findAll({
      include: [{ model: Category }, { model: Tag }, { model: ProductTag }]
    });
    res.status(200).json(productData);
  }catch (err) {
    res.status(500).json(err);
  }
});

// get one product
router.get('/:id', async (req, res) => {
  // find a single product by its `id`
  // be sure to include its associated Category and Tag data
  try {
    const productData = await Product.findByPk(req.params.id, {
      include: [{ model: Category }, { model: Tag }, { model: ProductTag }]
    });
    res.status(200).json(productData);
  }catch (err) {
    res.status(500).json(err);
  }

});

// create new product
router.post('/', async (req, res) => {
  const tagIds = await req.body.tagIds;
    const productData = await Product.create(
    {
      product_name: req.body.product_name,
      price: req.body.price,
      stock: req.body.stock,
      category_id: req.body.category_id,
    },
    )
    console.log(productData);
    console.log(tagIds);  
      // if there's product tags, we need to create pairings to bulk create in the ProductTag model
      if (req.body.tagIds.length) {
        const productTagIDArr = tagIds.map(tag_id => {
          return {
            product_id: productData.id,
            tag_id,
          }; 
        }) 
        console.log(productData, productTagIDArr);
        ProductTag.bulkCreate(productTagIDArr);
        return res.status(200).json(productData)
      } else {
        return res.status(200).json("success");
      }
      return res.status(200).json("success")
  });



// update product
router.put('/:id', (req, res) => {
  // update product data
  Product.update(req.body, {
    where: {
      id: req.params.id,
    },
  })
    .then((product) => {
      // find all associated tags from ProductTag
      return ProductTag.findAll({ where: { product_id: req.params.id } });
    })
    .then((productTags) => {
      // get list of current tag_ids
      const productTagIds = productTags.map(({ tag_id }) => tag_id);
      // create filtered list of new tag_ids
      const newProductTags = req.body.tagIds
        .filter((tag_id) => !productTagIds.includes(tag_id))
        .map((tag_id) => {
          return {
            product_id: req.params.id,
            tag_id,
          };
        });
      // figure out which ones to remove
      const productTagsToRemove = productTags
        .filter(({ tag_id }) => !req.body.tagIds.includes(tag_id))
        .map(({ id }) => id);

      // run both actions
      return Promise.all([
        ProductTag.destroy({ where: { id: productTagsToRemove } }),
        ProductTag.bulkCreate(newProductTags),
      ]);
    })
    .then((updatedProductTags) => res.json(updatedProductTags))
    .catch((err) => {
      // console.log(err);
      res.status(400).json(err);
    });
});

router.delete('/:id', async (req, res) => {
  // delete one product by its `id` value
  const deleteData = await Product.destroy({
    where: {
      id: req.params.id,
    },
  });
  return res.json(deleteData);
});

module.exports = router;
