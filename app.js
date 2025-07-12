const express = require("express");

const app = express();
var cors = require("cors");
const morgan = require("morgan");
const bodyparser = require("body-parser");
require('dotenv').config()

app.use(morgan("dev")); // to developer middel ware
app.use(
  bodyparser.urlencoded({
    extended: false,
  })
);
app.use(bodyparser.json());
app.use(cors());

// Routers
// General
const logsRouter = require("./routers/config/logs");
const userRouter = require("./routers/general/user");
const bussinessmanRouter = require("./routers/general/bussinessman");
const yarnRouter = require("./routers/general/yarn");
const yarnLotRouter = require("./routers/general/yarn-lot");
const warehouseRouter = require("./routers/general/warehouse");
const fabricRouter = require("./routers/general/fabric");
const fabricYarnsRouter = require("./routers/general/fabric-yarns");
const dyedFabriccRouter = require("./routers/general/dyed-fabric");
const circularKnittingMachineRouter = require("./routers/general/circular-knitting-machine");
const circularKnittingMachineBussinessmanRouter = require("./routers/general/circular-knitting-machine-bussinessman");
const deliveryCarRouter = require("./routers/general/delivery-car")
const colorCategoryRouter = require("./routers/general/color-category")
const colorRouter = require("./routers/general/color")
const dyeingServicesRouter = require("./routers/general/dyeing-services")
const dyeingServicesPricesRouter = require("./routers/general/dyeing-services-prices")
const dyeingColorsPricesRouter = require("./routers/general/dyeing-colors-prices")
const consigmentDyeingRouter = require("./routers/general/consigment-dyeing")
const consigmentManufacturingRouter = require("./routers/general/consigment-manufacturing")
const consigmentYarnRouter = require("./routers/general/consigment-yarn")
const usersPermissionsRouter = require("./routers/general/users-permissions")
const exchangeRateRouter = require("./routers/general/exchange-rate");
const gradeItemRouter = require("./routers/general/grade-item");

// WA
const waRouter = require("./routers/wa/wa");
const waAddRequisitionRouter = require("./routers/wa/wa-add-requisition");
const waAddRequisitionDetailsRouter = require("./routers/wa/wa-add-requisition-details");

const waSellRequisitionRouter = require("./routers/wa/wa-sell-requisition");
const waSellRequisitionDetailsRouter = require("./routers/wa/wa-sell-requisition-details");

const waReturnRequisitionRouter = require("./routers/wa/wa-return-requisition");
const waReturnRequisitionDetailsRouter = require("./routers/wa/wa-return-requisition-details");

const waReconciliationRequisitionRouter = require("./routers/wa/wa-reconciliation-requisition");
const waReconciliationRequisitionDetailsRouter = require("./routers/wa/wa-reconciliation-requisition-details");

const waYarnOrderRequisitionRouter = require("./routers/wa/wa-yarn-order-requisition");
const waYarnOrderRequisitionDetailsRouter = require("./routers/wa/wa-yarn-order-requisition-details");

const waExcuteOrderRequisitionRouter = require("./routers/wa/wa-execute-order-requisition");
const waExcuteOrderRequisitionDetailsRouter = require("./routers/wa/wa-execute-order-requisition-details");

const waTransitionBetweenWhRequisitionRouter = require("./routers/wa/wa-transition-between-wh-requisition");
const waTransitionBetweenWhRequisitionDetailsRouter = require("./routers/wa/wa-transition-between-wh-requisition-details");

const waPurchaseOrderRouter = require("./routers/wa/wa-purchase-order");
const waPurchaseOrderDetailsRouter = require("./routers/wa/wa-purchase-order-details");

const waReportRouter = require("./routers/wa/wa-report");

// WB
const wbRouter = require("./routers/wb/wb");
const wbTransportWaWbRequisitionRouter = require("./routers/wb/wb-transport-wa-wb");
const wbTransportWaWbRequisitionDetailsRouter = require("./routers/wb/wb-transport-wa-wb-details");
const wbReconciliationRequisitionRouter = require("./routers/wb/wb-reconciliation-requisition");
const wbReconciliationRequisitionDetailsRouter = require("./routers/wb/wb-reconciliation-requisition-details");
const wbTransportRequisitionWbWaRouter = require("./routers/wb/wb-transport-requisition-wb-wa");
const wbTransportRequisitionWbWaDetailsRouter = require("./routers/wb/wb-transport-requisition-wb-wa-details");
const wbManufacturingOrderRequisitionRouter = require("./routers/wb/wb-manufacturing-order-requisition");
const wbManufacturingOrderRequisitionDetailsRouter = require("./routers/wb/wb-manufacturing-order-requisition-details");
const wbManufacturingRequisitionRouter = require("./routers/wb/wb-manufacturing-requisition");
const wbManufacturingOutputRouter = require("./routers/wb/wb-manufacturing-output");
const wbManufacturingInputRouter = require("./routers/wb/wb-manufacturing-input");
const wbTransitionBetweenIndustriesRequisitionRouter = require("./routers/wb/wb-transition-between-industries-requisition");
const wbTransitionBetweenIndustriesRequisitionDetailsRouter = require("./routers/wb/wb-transition-between-industries-requisition-details");
const wbReportRouter = require("./routers/wb/wb-report");

// WC
const wcRouter = require("./routers/wc/wc");

const wcAddRequisitionRouter = require("./routers/wc/wc-add-requisition");
const wcAddRequisitionDetailsRouter = require("./routers/wc/wc-add-requisition-details");

const wcSellRequisitionRouter = require("./routers/wc/wc-sell-requisition");
const wcSellRequisitionDetailsRouter = require("./routers/wc/wc-sell-requisition-details");

const wcReturnRequisitionRouter = require("./routers/wc/wc-return-requisition");
const wcReturnRequisitionDetailsRouter = require("./routers/wc/wc-return-requisition-details");

const wcReconciliationRequisitionRouter = require("./routers/wc/wc-reconciliation-requisition");
const wcReconciliationRequisitionDetailsRouter = require("./routers/wc/wc-reconciliation-requisition-details");

const wcFabricOrderRequisitionRouter = require("./routers/wc/wc-fabric-order-requisition");
const wcFabricOrderRequisitionDetailsRouter = require("./routers/wc/wc-fabric-order-requisition-details");

const wcExcuteOrderRequisitionRouter = require("./routers/wc/wc-execute-order-requisition");
const wcExcuteOrderRequisitionDetailsRouter = require("./routers/wc/wc-execute-order-requisition-details");

const wcTransitionBetweenWHRequisitionRouter = require("./routers/wc/wc-transition-between-wh-requisition");
const wcTransitionBetweenWHRequisitionDetailsRouter = require("./routers/wc/wc-transition-between-wh-requisition-details");

const wcTransitionBetweenOrdersRequisitionRouter = require("./routers/wc/wc-transition-between-orders-requisition");
const wcTransitionBetweenOrdersRequisitionDetailsRouter = require("./routers/wc/wc-transition-between-orders-requisition-details");

const wcReportRouter = require("./routers/wc/wc-report");

// WD
const wdRouter = require("./routers/wd/wd");

const wdTransportWcWdRequisitionRouter = require("./routers/wd/wd-transport-wc-wd");
const wdTransportWcWdRequisitionDetailsRouter = require("./routers/wd/wd-transport-wc-wd-details");

const wdDyeingOrderRequisitionRouter = require("./routers/wd/wd-dyeing-order-requisition");
const wdDyeingOrderRequisitionDetailsRouter = require("./routers/wd/wd-dyeing-order-requisition-details");

const wdFormDyeingRequisitionRouter = require("./routers/wd/wd-form-dyeing-requisition");
const wdFormDyeingRequisitionDetailsRouter = require("./routers/wd/wd-form-dyeing-requisition-details");

const wdFormDyeingRequisitionDetailsDyeingServicesRouter = require("./routers/wd/wd-form-dyeing-requisition-details-dyeing-services");

const wdDyeingRequisitionRouter = require("./routers/wd/wd-dyeing-requisition");
const wdDyeingRequisitionDetailsRouter = require("./routers/wd/wd-dyeing-requisition-details");

const wdReconciliationRequisitionRouter = require("./routers/wd/wd-reconciliation-requisition");
const wdReconciliationRequisitionDetailsRouter = require("./routers/wd/wd-reconciliation-requisition-details");

const wdTransportRequisitionWdWcRouter = require("./routers/wd/wd-transport-requisition-wd-wc");
const wdTransportRequisitionWdWcDetailsRouter = require("./routers/wd/wd-transport-requisition-wd-wc-details");

const wdTransitionBetweenDyersRequisitionRouter = require("./routers/wd/wd-transition-between-dyers-requisition");
const wdTransitionBetweenDyersRequisitionDetailsRouter = require("./routers/wd/wd-transition-between-dyers-requisition-details");

const wdSettlingFormRouter = require("./routers/wd/wd-settling-form");

const wdReportRouter = require("./routers/wd/wd-report");

// WE
const weRouter = require("./routers/we/we");

const weAddRequisitionRouter = require("./routers/we/we-add-requisition");
const weAddRequisitionDetailsRouter = require("./routers/we/we-add-requisition-details");

const weSellRequisitionRouter = require("./routers/we/we-sell-requisition");
const weSellRequisitionDetailsRouter = require("./routers/we/we-sell-requisition-details");

const weSellRequisitionDirectRouter = require("./routers/we/we-sell-requisition-direct");
const weSellRequisitionDirectDetailsRouter = require("./routers/we/we-sell-requisition-direct-details");

const weReconciliationRequisitionRouter = require("./routers/we/we-reconciliation-requisition");
const weReconciliationRequisitionDetailsRouter = require("./routers/we/we-reconciliation-requisition-details");

const weReturnRequisitionRouter = require("./routers/we/we-return-requisition");
const weReturnRequisitionDetailsRouter = require("./routers/we/we-return-requisition-details");

const weReturnSellRequisitionRouter = require("./routers/we/we-return-sell-requisition");
const weReturnSellRequisitionDetailsRouter = require("./routers/we/we-return-sell-requisition-details");

const weDyedFabricOrderRequisitionRouter = require("./routers/we/we-dyed-fabric-order-requisition");
const weDyedFabricOrderRequisitionDetailsRouter = require("./routers/we/we-dyed-fabric-order-requisition-details");

const weExcuteOrderRequisitionRouter = require("./routers/we/we-execute-order-requisition");
const weExcuteOrderRequisitionDetailsRouter = require("./routers/we/we-execute-order-requisition-details");

const weTransitionBetweenWHRequisitionRouter = require("./routers/we/we-transition-between-wh-requisition");
const weTransitionBetweenWHRequisitionDetailsRouter = require("./routers/we/we-transition-between-wh-requisition-details");

const weTransitionBetweenOrdersRequisitionRouter = require("./routers/we/we-transition-between-orders-requisition");
const weTransitionBetweenOrdersRequisitionDetailsRouter = require("./routers/we/we-transition-between-orders-requisition-details");

const weReportRouter = require("./routers/we/we-report");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type,authorization,Accept-Language,X-Requested-With"
  );

  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Methods", "*");
    // res.header("Access-Control-Allow-Methods",'Put,Post,Patch,Delete,Get,put');
    return res.status(200).json({});
  }

  next();
});

// Uses Routers
// General

app.all("*", logsRouter)
app.use("/api/user", userRouter);
app.use("/api/bussinessman", bussinessmanRouter);
app.use("/api/yarn", yarnRouter);
app.use("/api/yarn-lot", yarnLotRouter);
app.use("/api/warehouse", warehouseRouter);
app.use("/api/fabric", fabricRouter);
app.use("/api/fabric-yarns", fabricYarnsRouter);
app.use("/api/dyed-fabric", dyedFabriccRouter);
app.use('/api/circular-knitting-machine', circularKnittingMachineRouter)
app.use('/api/circular-knitting-machine-bussinessman', circularKnittingMachineBussinessmanRouter)
app.use('/api/circular-knitting-machine-bussinessman', circularKnittingMachineBussinessmanRouter)
app.use('/api/delivery-car', deliveryCarRouter)
app.use('/api/color-category', colorCategoryRouter)
app.use('/api/color', colorRouter)
app.use('/api/dyeing-services', dyeingServicesRouter)
app.use('/api/dyeing-services-prices', dyeingServicesPricesRouter)
app.use('/api/dyeing-colors-prices', dyeingColorsPricesRouter)
app.use('/api/consigment-dyeing', consigmentDyeingRouter)
app.use('/api/consigment-manufacturing', consigmentManufacturingRouter)
app.use('/api/consigment-yarn', consigmentYarnRouter)
app.use('/api/user-permissions', usersPermissionsRouter)
app.use("/api/exchange-rate", exchangeRateRouter);
app.use("/api/grade-item", gradeItemRouter);

// WA Yarn
app.use("/api/wa", waRouter);
app.use("/api/wa-add-requisition", waAddRequisitionRouter);
app.use("/api/wa-add-requisition-details", waAddRequisitionDetailsRouter);

app.use("/api/wa-sell-requisition", waSellRequisitionRouter);
app.use("/api/wa-sell-requisition-details", waSellRequisitionDetailsRouter);

app.use("/api/wa-return-requisition", waReturnRequisitionRouter);
app.use("/api/wa-return-requisition-details", waReturnRequisitionDetailsRouter);

app.use("/api/wa-reconciliation-requisition", waReconciliationRequisitionRouter);
app.use("/api/wa-reconciliation-requisition-details", waReconciliationRequisitionDetailsRouter);

app.use('/api/wa-yarn-order-requisition', waYarnOrderRequisitionRouter)
app.use('/api/wa-yarn-order-requisition-details', waYarnOrderRequisitionDetailsRouter)

app.use('/api/wa-purchase-order', waPurchaseOrderRouter)
app.use('/api/wa-purchase-order-details', waPurchaseOrderDetailsRouter)

app.use('/api/wa-execute-order-requisition', waExcuteOrderRequisitionRouter)
app.use('/api/wa-execute-order-requisition-details', waExcuteOrderRequisitionDetailsRouter)

app.use('/api/wa-transition-between-wh-requisition', waTransitionBetweenWhRequisitionRouter)
app.use('/api/wa-transition-between-wh-requisition-details', waTransitionBetweenWhRequisitionDetailsRouter)

app.use("/api/wa-report", waReportRouter);

// WB
app.use("/api/wb", wbRouter);
app.use("/api/wb-transport-wa-wb-requisition", wbTransportWaWbRequisitionRouter);
app.use("/api/wb-transport-wa-wb-requisition-details", wbTransportWaWbRequisitionDetailsRouter);
app.use("/api/wb-reconciliation-requisition", wbReconciliationRequisitionRouter);
app.use("/api/wb-reconciliation-requisition-details", wbReconciliationRequisitionDetailsRouter);
app.use("/api/wb-transport-wb-wa-requisition", wbTransportRequisitionWbWaRouter);
app.use("/api/wb-transport-wb-wa-requisition-details", wbTransportRequisitionWbWaDetailsRouter);
app.use('/api/wb-manufactiring-order-requisition', wbManufacturingOrderRequisitionRouter)
app.use('/api/wb-manufactiring-order-requisition-details', wbManufacturingOrderRequisitionDetailsRouter)
app.use('/api/wb-manufactiring-requisition', wbManufacturingRequisitionRouter)
app.use('/api/wb-manufactiring-output', wbManufacturingOutputRouter)
app.use('/api/wb-manufactiring-input', wbManufacturingInputRouter)
app.use('/api/wb-transition-between-industries-requisition', wbTransitionBetweenIndustriesRequisitionRouter)
app.use('/api/wb-transition-between-industries-requisition-details', wbTransitionBetweenIndustriesRequisitionDetailsRouter)

app.use("/api/wb-report", wbReportRouter);

// Wc
app.use("/api/wc", wcRouter);

app.use("/api/wc-add-requisition", wcAddRequisitionRouter);
app.use("/api/wc-add-requisition-details", wcAddRequisitionDetailsRouter);

app.use("/api/wc-sell-requisition", wcSellRequisitionRouter);
app.use("/api/wc-sell-requisition-details", wcSellRequisitionDetailsRouter);

app.use("/api/wc-return-requisition", wcReturnRequisitionRouter);
app.use("/api/wc-return-requisition-details", wcReturnRequisitionDetailsRouter);

app.use("/api/wc-reconciliation-requisition", wcReconciliationRequisitionRouter);
app.use("/api/wc-reconciliation-requisition-details", wcReconciliationRequisitionDetailsRouter);

app.use('/api/wc-fabric-order-requisition', wcFabricOrderRequisitionRouter)
app.use('/api/wc-fabric-order-requisition-details', wcFabricOrderRequisitionDetailsRouter)

app.use('/api/wc-execute-order-requisition', wcExcuteOrderRequisitionRouter)
app.use('/api/wc-execute-order-requisition-details', wcExcuteOrderRequisitionDetailsRouter)

app.use('/api/wc-transition-between-wh-requisition', wcTransitionBetweenWHRequisitionRouter)
app.use('/api/wc-transition-between-wh-requisition-details', wcTransitionBetweenWHRequisitionDetailsRouter)

app.use('/api/wc-transition-between-orders-requisition', wcTransitionBetweenOrdersRequisitionRouter)
app.use('/api/wc-transition-between-orders-requisition-details', wcTransitionBetweenOrdersRequisitionDetailsRouter)

app.use("/api/wc-report", wcReportRouter);

// WD
app.use("/api/wd", wdRouter);

app.use("/api/wd-transport-wc-wd-requisition", wdTransportWcWdRequisitionRouter);
app.use("/api/wd-transport-wc-wd-requisition-details", wdTransportWcWdRequisitionDetailsRouter);

app.use("/api/wd-dyeing-order-requisition", wdDyeingOrderRequisitionRouter);
app.use("/api/wd-dyeing-order-requisition-details", wdDyeingOrderRequisitionDetailsRouter);

app.use("/api/wd-form-dyeing-requisition", wdFormDyeingRequisitionRouter);
app.use("/api/wd-form-dyeing-requisition-details", wdFormDyeingRequisitionDetailsRouter);

app.use("/api/wd-form-dyeing-requisition-details-dyeing-services", wdFormDyeingRequisitionDetailsDyeingServicesRouter);

app.use("/api/wd-dyeing-requisition", wdDyeingRequisitionRouter);
app.use("/api/wd-dyeing-requisition-details", wdDyeingRequisitionDetailsRouter);

app.use("/api/wd-reconciliation-requisition", wdReconciliationRequisitionRouter);
app.use("/api/wd-reconciliation-requisition-details", wdReconciliationRequisitionDetailsRouter);

app.use("/api/wd-transport-wd-wc-requisition", wdTransportRequisitionWdWcRouter);
app.use("/api/wd-transport-wd-wc-requisition-details", wdTransportRequisitionWdWcDetailsRouter);

app.use('/api/wd-transition-between-dyers-requisition', wdTransitionBetweenDyersRequisitionRouter)
app.use('/api/wd-transition-between-dyers-requisition-details', wdTransitionBetweenDyersRequisitionDetailsRouter)

app.use("/api/wd-settling-form", wdSettlingFormRouter);

app.use("/api/wd-report", wdReportRouter);

// WE
app.use("/api/we", weRouter);

app.use("/api/we-add-requisition", weAddRequisitionRouter);
app.use("/api/we-add-requisition-details", weAddRequisitionDetailsRouter);

app.use("/api/we-sell-requisition", weSellRequisitionRouter);
app.use("/api/we-sell-requisition-details", weSellRequisitionDetailsRouter);

app.use("/api/we-sell-requisition-direct", weSellRequisitionDirectRouter);
app.use("/api/we-sell-requisition-direct-details", weSellRequisitionDirectDetailsRouter);

app.use("/api/we-reconcilition-requisition", weReconciliationRequisitionRouter);
app.use("/api/we-reconcilition-requisition-details", weReconciliationRequisitionDetailsRouter);

app.use("/api/we-return-requisition", weReturnRequisitionRouter);
app.use("/api/we-return-requisition-details", weReturnRequisitionDetailsRouter);

app.use("/api/we-return-sell-requisition", weReturnSellRequisitionRouter);
app.use("/api/we-return-sell-requisition-details", weReturnSellRequisitionDetailsRouter);

app.use('/api/we-dyed-fabric-order-requisition', weDyedFabricOrderRequisitionRouter)
app.use('/api/we-dyed-fabric-order-requisition-details', weDyedFabricOrderRequisitionDetailsRouter)

app.use('/api/we-execute-order-requisition', weExcuteOrderRequisitionRouter)
app.use('/api/we-execute-order-requisition-details', weExcuteOrderRequisitionDetailsRouter)

app.use("/api/we-transition-between-wh-requisition", weTransitionBetweenWHRequisitionRouter);
app.use("/api/we-transition-between-wh-requisition-details", weTransitionBetweenWHRequisitionDetailsRouter);

app.use("/api/we-transition-between-orders-requisition", weTransitionBetweenOrdersRequisitionRouter);
app.use("/api/we-transition-between-orders-requisition-details", weTransitionBetweenOrdersRequisitionDetailsRouter);

app.use("/api/we-report", weReportRouter);

app.use((req, res, next) => {
  const error = new Error("not found");
  error.status = 404;
  console.log(error);
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  //if(error)	throw error;
  console.log(error);
  if (error.status == 404)
    res.json({
      error: {
        message: `not found 404`,
      },
    });
  // console.log(error);
  else
    res.json({
      error: {
        massage: "other error crash app ",
        err: error.massage,
      },
    });
});

module.exports = app;
