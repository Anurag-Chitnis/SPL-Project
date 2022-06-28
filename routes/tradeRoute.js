const express = require("express");
const controller = require("../controllers/tradeController");
const tradeRouter = express.Router();
const {
  validateId,
  validateItem,
  validateResult,
} = require("../middlewares/validator");
const { isLoggedIn, isOwner } = require("../middlewares/auth");

tradeRouter.get("/newTrade", isLoggedIn, controller.newTrade);

tradeRouter.get("/", controller.trades);

tradeRouter.get("/:id", validateId, controller.trade);

tradeRouter.post(
  "/",
  isLoggedIn,
  validateItem,
  validateResult,
  controller.create
);

tradeRouter.get("/:id/edit", validateId, isLoggedIn, isOwner, controller.edit);

tradeRouter.put(
  "/:id",
  validateId,
  isLoggedIn,
  isOwner,
  validateItem,
  validateResult,
  controller.update
);

tradeRouter.put("/:id/tradeIt", validateId, isLoggedIn, controller.tradeIt);

tradeRouter.put(
  "/:id,:tradeItemid/selectedTrade",
  validateId,
  isLoggedIn,
  controller.tradeSelected
);

tradeRouter.put(
  "/:id/cancelOffer",
  validateId,
  isLoggedIn,
  controller.cancelOffer
);

tradeRouter.put(
  "/:id,:myItemId/acceptOffer",
  validateId,
  isLoggedIn,
  controller.acceptOffer
);

tradeRouter.get(
  "/:id/manageOffer",
  validateId,
  isLoggedIn,
  isOwner,
  controller.manageOffer
);

tradeRouter.delete("/:id", validateId, isLoggedIn, isOwner, controller.delete);

module.exports = tradeRouter;
