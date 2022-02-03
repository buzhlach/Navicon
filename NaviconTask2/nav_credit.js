var Navicon = Navicon || {};

Navicon.nav_credit = (function () {

    let blockSaveIfStartDateGreaterEndDate = function () {
        let dateStartAttr = Xrm.Page.getAttribute("nav_datestart");
        let dateEndAttr = Xrm.Page.getAttribute("nav_dateend");
        if (!dateStartAttr || !dateEndAttr) {
            console.error("don't have all fields for blockSaveIfStartDateGreaterEndDate");
            return;
        }

        let dateStart = dateStartAttr.getValue();
        let dateEnd = dateEndAttr.getValue();

        if (!dateStart || !dateEnd) {
            console.error("don't have all fields for blockSaveIfStartDateGreaterEndDate");
            return;
        }

        let year = dateEnd.getFullYear() - dateStart.getFullYear();
        let month = dateEnd.getMonth() - dateStart.getMonth();
        if (month < 0 || (month === 0 && dateEnd.getDate() < dateStart.getDate())) {
            year--;
        }
        if (year < 1) {
            alert("the end date must be at least one year greater than the start date");
            return true;
        }
        else {
            return false;
        }
    }

    return {
        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onSave: function (context) {
            let saveEvent = context.getEventArgs();

            let prevent = blockSaveIfStartDateGreaterEndDate();
            if (prevent) {
                saveEvent.preventDefault();
            }
        }
    }
})();