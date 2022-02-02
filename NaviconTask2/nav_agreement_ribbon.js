var Navicon = Navicon || {};

Navicon.nav_agreement_ribbon = (function () {

    return {

        /**
         * Пересчитать цену кредита и полную цену кредита.
         */
        recalculateCredit: function () {
            let creditAmountAttr = Xrm.Page.getAttribute("nav_creditamount");
            let summa = Xrm.Page.getAttribute("nav_summa").getValue();
            let initialfee = Xrm.Page.getAttribute("nav_initialfee").getValue();
            let fullCreditAmountAttr = Xrm.Page.getAttribute("nav_fullcreditamount");
            let creditId = Xrm.Page.getAttribute("nav_creditid").getValue();
            let creditPeriod = Xrm.Page.getAttribute("nav_creditperiod").getValue();

            if(!creditAmountAttr||!summa||!initialfee){
                console.error("try to get nav_creditamount, nav_summa, nav_initialfee attr but get null");
                return;
            }

            let newCreditAmount = summa - initialfee;
            creditAmountAttr.setValue(newCreditAmount);

            if(!creditId||!creditPeriod||!fullCreditAmountAttr){
                console.error("try to get nav_creditid, nav_creditperiod, nav_fullcreditamount attr but get null");
                return;
            }

            creditId = creditId[0].id;
            creditId = creditId.toLowerCase().substring(1, creditId.length - 1);

            Xrm.WebApi.retrieveRecord("nav_credit", creditId, "?$select=nav_percent").then(
                function success(result) {
                    console.log(result);
                    let newfullCreditAmount = result.nav_percent / 100 * creditPeriod * newCreditAmount + newCreditAmount;
                    fullCreditAmountAttr.setValue(newfullCreditAmount);
                },
                function (error) {
                    console.log(error.message);
                }
            );

        }
    }
})();


