const router = require('express').Router();
const { Tag, Product, ProductTag } = require('../../models');

// The `/api/tags` endpoint

router.get('/', async (req, res) => {
  // find all tags
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findAll({
      include: [{ model: Product }, { model: ProductTag }]
    });
    res.status(200).json(tagData);
  }catch (err) {
    res.status(500).json(err);
  }
});

router.get('/:id', async (req, res) => {
  // find a single tag by its `id`
  // be sure to include its associated Product data
  try {
    const tagData = await Tag.findByPk(req.params.id, {
      include: [{ model: Product }, { model: ProductTag }]
    });
    res.status(200).json(tagData);
  }catch (err) {
    res.status(500).json(err);
  }
});

router.post('/', async (req, res) => {
  // create a new tag
  const tagData = await Tag.create(req.body);
  return res.json(tagData);
});

router.put('/:id', async (req, res) => {
  // update a tag's name by its `id` value
  const tagData = await Tag.update(
    {
      tag_name: req.body.tag_name,
    },
    {
      where: {
        id: req.params.id,
      }
    });
    return res.json(tagData);
});

router.delete('/:id', async (req, res) => {
  // delete on tag by its `id` value
  const deleteData = await Tag.destroy({
    where: {
      id: req.params.id,
    },
  });
  return res.json(deleteData);
});

module.exports = router;
