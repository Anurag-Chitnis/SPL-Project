const itemModel = require("../models/item");
const userModel = require("../models/user");

exports.trades = (req, res, next) => {
  items = itemModel
    .find()
    .then((response) => {
      const categories = itemModel
        .distinct("category")
        .then((r) => {
          res.render("./trades/trades", { items: response, categories: r });
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.newTrade = (req, res) => {
  res.render("./trades/newTrade");
};

exports.trade = (req, res, next) => {
  let id = req.params.id;

  itemModel
    .findById(id)
    .populate("owner", "firstName lastName")
    .then((item) => {
      if (item) {
        res.render("./trades/trade", { item });
      } else {
        let err = new Error("Cannot find a trade with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.create = (req, res, next) => {
  let item = new itemModel(req.body);
  item.owner = req.session.user;

  item
    .save()
    .then((item) => {
      req.flash("success", "Item is created successfully");
      res.redirect("/trades");
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        return res.redirect("back");
      }
      next(err);
    });
};

exports.edit = (req, res, next) => {
  let id = req.params.id;

  itemModel
    .findById(id)
    .then((item) => {
      if (item) {
        return res.render("./trades/editTrade", { item });
      } else {
        let err = new Error("Cannot find a trade with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.update = (req, res, next) => {
  let item = req.body;
  let id = req.params.id;

  itemModel
    .findByIdAndUpdate(id, item, {
      useFindAndModify: false,
      runValidators: true,
    })
    .then((item) => {
      if (item) {
        req.flash("success", "Item is edited successfully.");
        res.redirect("/trades/" + id);
      } else {
        let err = new Error("Cannot find a trade with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => {
      if (err.name === "ValidationError") {
        req.flash("error", err.message);
        res.redirect("back");
      }
      next(err);
    });
};

exports.tradeIt = (req, res, next) => {
  let tradeItem = req.params.id;
  let userId = req.session.user;

  Promise.all([userModel.findById(userId), itemModel.find({ owner: userId })])
    .then((results) => {
      const [user, itemData] = results;

      itemModel
        .findById(tradeItem)
        .then((item) => {
          if (item) {
            item.trade.tradeItemID = tradeItem;
            item.trade.tradeOwnerID = item.owner;
            item.trade.tradeStatus = "Stage 1";
            item.tradeListBy = userId;
            item.status = "Offer Pending";

            let selectedTradeItem = item;

            itemModel
              .findByIdAndUpdate(tradeItem, item, {
                useFindAndModify: false,
                runValidators: true,
              })
              .then((item) => {
                if (item) {
                  req.flash("success", "Which your item you want to trade?");
                  res.render("./trades/tradeIt", {
                    itemData,
                    selectedTradeItem,
                  });
                } else {
                  let err = new Error(
                    "Cannot find a trade with id " + tradeItem
                  );
                  err.status = 404;
                  next(err);
                }
              })
              .catch((err) => {
                if (err.name === "ValidationError") {
                  req.flash("error", err.message);
                  res.redirect("back");
                }
                next(err);
              });
          } else {
            let err = new Error("Cannot find a trade with id " + id);
            err.status = 404;
            next(err);
          }
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.tradeSelected = (req, res, next) => {
  let userItemID = req.params.id;
  let tradeItemID = req.params.tradeItemid;
  let userId = req.session.user;

  itemModel
    .findById(userItemID)
    .then((item) => {
      if (item) {
        item.trade.tradeItemID = tradeItemID;
        item.status = "Offer Pending";
        itemModel
          .findByIdAndUpdate(userItemID, item, {
            useFindAndModify: false,
            runValidators: true,
          })
          .then((item) => {
            if (item) {
              itemModel
                .findById(tradeItemID)
                .then((tradeItemResponse) => {
                  tradeItemResponse.trade.myItemID = userItemID;
                  tradeItemResponse.trade.tradeItemID = tradeItemID;

                  itemModel
                    .findByIdAndUpdate(tradeItemID, tradeItemResponse, {
                      useFindAndModify: false,
                      runValidators: true,
                    })
                    .then((result) => {
                      req.flash(
                        "success",
                        "Offer is made. You can manage your offer on your profile."
                      );
                      res.redirect("/trades");
                    })
                    .catch((err) => next(err));
                })
                .catch((err) => next(err));
            } else {
              let err = new Error("Cannot find a trade with id " + userItemID);
              err.status = 404;
              next(err);
            }
          })
          .catch((err) => {
            if (err.name === "ValidationError") {
              req.flash("error", err.message);
              res.redirect("back");
            }
            next(err);
          });
      } else {
        let err = new Error("Cannot find a trade with id " + userItemID);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.cancelOffer = (req, res, next) => {
  let id = req.params.id;
  let userId = req.session.user;

  itemModel
    .findById(id)
    .then((item) => {
      if (item) {
        item.status = "Availabel";
        item.tradeListBy = "-";
        itemModel
          .findByIdAndUpdate(id, item, {
            useFindAndModify: false,
            runValidators: true,
          })
          .then((item) => {
            if (item) {
              let userItemID = item.trade.myItemID;

              if (userItemID != 0) {
                itemModel
                  .findById(userItemID)
                  .then((userItemInfo) => {
                    userItemInfo.status = "Availabel";
                    itemModel
                      .findByIdAndUpdate(userItemID, userItemInfo, {
                        useFindAndModify: false,
                        runValidators: true,
                      })
                      .then((userData) => {
                        req.flash("success", "Offer is cancelled");
                        res.redirect("/trades");
                      })
                      .catch((err) => {
                        if (err.name === "ValidationError") {
                          req.flash("error", err.message);
                          res.redirect("back");
                        }
                        next(err);
                      });
                  })
                  .catch((err) => next(err));
              } else {
                res.redirect("back");
              }
            } else {
              let err = new Error("Cannot find a trade with id " + id);
              err.status = 404;
              next(err);
            }
          })
          .catch((err) => {
            if (err.name === "ValidationError") {
              req.flash("error", err.message);
              res.redirect("back");
            }
            next(err);
          });
      } else {
        let err = new Error("Cannot find a trade with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.manageOffer = (req, res, next) => {
  let myItemid = req.params.id;
  let userId = req.session.user;

  itemModel
    .find()
    .then((allItems) => {
      if (allItems) {
        allItems.forEach((tradeitem) => {
          if (tradeitem.trade.myItemID == myItemid) {
            if (myItemid != 0) {
              const myItem = itemModel
                .findById(myItemid)
                .then((myItemInfo) => {
                  req.flash("success", "Are you sure about this trade?");
                  return res.render("./trades/confirmTrade", {
                    tradeitem,
                    myItem: myItemInfo,
                    userId,
                  });
                })
                .catch((err) => next(err));
            }
          } else {
            if (myItemid != 0) {
              const myItemData = itemModel
                .findById(myItemid)
                .then((myItemDataRes) => {
                  if (myItemDataRes.trade.myItemID != 0) {
                    const tradeItemData = itemModel
                      .findById(myItemDataRes.trade.myItemID)
                      .then((tradeItemDataRes) => {
                        req.flash("success", "Are you sure about this trade?");
                        return res.render("./trades/confirmTrade", {
                          tradeitem: tradeItemDataRes,
                          myItem: myItemDataRes,
                          userId,
                        });
                      })
                      .catch((err) => next(err));
                  }
                })
                .catch((err) => next(err));
            }
          }
        });
      } else {
        let err = new Error("Cannot find a trade with id " + myItemid);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};

exports.acceptOffer = (req, res, next) => {
  let tradeItemId = req.params.id;
  let myItemId = req.params.myItemId;

  itemModel
    .findById(tradeItemId)
    .then((tradeItemData) => {
      tradeItemData.status = "Traded";
      tradeItemData.trade.status = "Completed";

      itemModel
        .findByIdAndUpdate(tradeItemId, tradeItemData, {
          useFindAndModify: false,
          runValidators: true,
        })
        .then((tradeItemRes) => {
          itemModel
            .findById(myItemId)
            .then((myItemData) => {
              myItemData.status = "Traded";
              myItemData.trade.status = "Completed";

              itemModel
                .findByIdAndUpdate(myItemId, myItemData, {
                  useFindAndModify: false,
                  runValidators: true,
                })
                .then((myItemRes) => {
                  req.flash(
                    "success",
                    "Congratulations!!!! Your trade is completed"
                  );
                  res.redirect("/trades");
                })
                .catch((err) => next(err));
            })
            .catch((err) => next(err));
        })
        .catch((err) => next(err));
    })
    .catch((err) => next(err));
};

exports.delete = (req, res, next) => {
  let id = req.params.id;

  itemModel
    .findByIdAndDelete(id, { useFindAndModify: false })
    .then((item) => {
      if (item) {
        req.flash("success", "Item is deleted");
        res.redirect("/trades");
      } else {
        let err = new Error("Can not find a trade with id " + id);
        err.status = 404;
        next(err);
      }
    })
    .catch((err) => next(err));
};
