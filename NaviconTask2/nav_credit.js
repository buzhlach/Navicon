var Navicon = Navicon || {};

Navicon.nav_credit = (function () {
    return {
        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onSave: function (context) {
            let formContext = context.getFormContext();
            let saveEvent = context.getEventArgs();

            if (!!formContext) {
                let dateStartAttr = formContext.getAttribute("nav_datestart");
                let dateEndAttr = formContext.getAttribute("nav_dateend");
                if(!!dateStartAttr&&!!dateEndAttr){
                    let dateStart = dateStartAttr.getValue();
                    let dateEnd = dateEndAttr.getValue();

                    if(!!dateStart&&!!dateEnd){
                        let dateStart = dateStartAttr.getValue();
                        let dateEnd = dateEndAttr.getValue();

                        let year = dateEnd.getFullYear()-dateStart.getFullYear();
                        let month = dateEnd.getMonth()-dateStart.getMonth();
                        if( month<0 ||(month===0 && dateEnd.getDate()<dateStart.getDate())){
                            year--;
                        }
                        if(year<1){
                            alert("the end date must be at least one year greater than the start date")
                            saveEvent.preventDefault();
                        }
                    }
                    else alert("try to get nav_datestart and nav_dateend value, but get null");
                }
                else alert("try to get nav_datestart and nav_dateend control, but get null");
            }
            else alert("try to get formContext control, but get null");
        }
    }
})();