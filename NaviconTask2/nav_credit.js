var Navicon = Navicon || {};

Navicon.nav_credit = (function () {
    return {
        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onSave: function (context) {
            let saveEvent = context.getEventArgs();

            let dateStartAttr = Xrm.Page.getAttribute("nav_datestart");
            let dateEndAttr = Xrm.Page.getAttribute("nav_dateend");
            if (!dateStartAttr || !dateEndAttr) {
                alert("try to get nav_datestart and nav_dateend control, but get null");
                return;
            }

            let dateStart = dateStartAttr.getValue();
            let dateEnd = dateEndAttr.getValue();

            if (!dateStart || !dateEnd) {
                alert("try to get nav_datestart and nav_dateend value, but get null");
                return;
            }

            let year = dateEnd.getFullYear() - dateStart.getFullYear();
            let month = dateEnd.getMonth() - dateStart.getMonth();
            if (month < 0 || (month === 0 && dateEnd.getDate() < dateStart.getDate())) {
                year--;
            }
            if (year < 1) {
                alert("the end date must be at least one year greater than the start date")
                saveEvent.preventDefault();
            }
        }
    }
})();