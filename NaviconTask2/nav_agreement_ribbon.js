var Navicon = Navicon || {};

Navicon.nav_agreement_ribbon = (function () {

    return {

        /**
         * Пересчитать цену кредита и полную цену кредита.
         */
        recalculateCredit: function () {
            let creditAmountAttr = Xrm.Page.getAttribute("nav_creditamount");
            let summaAttr = Xrm.Page.getAttribute("nav_summa");
            let initialfeeAttr = Xrm.Page.getAttribute("nav_initialfee");
            let fullCreditAmountAttr = Xrm.Page.getAttribute("nav_fullcreditamount");
            let creditIdAttr = Xrm.Page.getAttribute("nav_creditid");
            let creditPeriodAttr = Xrm.Page.getAttribute("nav_creditperiod");

            if (!creditAmountAttr || !summaAttr || !initialfeeAttr || !fullCreditAmountAttr || !creditIdAttr || !creditPeriodAttr) {
                console.error("don't have all fields for recalculateCredit");
                return;
            }

            let summa = summaAttr.getValue();
            let initialfee = initialfeeAttr.getValue();
            let creditId = creditIdAttr.getValue();
            let creditPeriod = creditPeriodAttr.getValue();

            if (!summa || !creditId ||!creditPeriod) {
                console.error("don't have all fields for recalculateCredit");
                return;
            }

            if (!initialfee) {
                initialfee = 0;
            }


            let newCreditAmount = summa - initialfee;
            creditAmountAttr.setValue(newCreditAmount);

            creditId = creditId[0].id;
            creditId = creditId.toLowerCase().substring(1, creditId.length - 1);

            let req = new XMLHttpRequest();
            req.open("GET", Xrm.Utility.getGlobalContext().getClientUrl() +
                "/api/data/v9.0/nav_credits?$select=nav_percent&$filter=nav_creditid eq " + creditId, false);

            req.send();
            if (req.status != 200) {
                console.error(req.status + ': ' + req.statusText);
                return;
            }

            let reqObj = JSON.parse(req.response);

            if(creditPeriod * newCreditAmount == 0){
                return;
            }

            let newfullCreditAmount = reqObj.value[0].nav_percent / 100 * creditPeriod * newCreditAmount + newCreditAmount;
            fullCreditAmountAttr.setValue(newfullCreditAmount);

        }
    }
})();


