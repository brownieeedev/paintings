exports.deleteOne = (Model) => {
  async (req, res, next) => {
    const doc = await Model.findByIdAndDelete(req.params.id);

    if (!doc) {
      return res.status(404).send('Not found');
    }
    res.status(204).json({
      status: 'success',
      data: null,
    });
  };
};
