var Navicon = Navicon || {};

Navicon.nav_communication = (function () {
    let onTypeChanged = function(context){
        let formContext = context.getFormContext();

        let typeValue = formContext.getAttribute("nav_type")
            .getValue();

        let phoneControl = formContext.getControl("nav_phone");
        let emailControl = formContext.getControl("nav_email");

        if (!!typeValue) {
            if (!!phoneControl && typeValue==1) {
                phoneControl.setVisible(true);
                emailControl.setVisible(false);
            }
            else if (!!emailControl && typeValue==2) {
                emailControl.setVisible(true);
                phoneControl.setVisible(false);
            }
        }
        else {
            phoneControl.setVisible(false);
            emailControl.setVisible(false);
        };
    }
    return {

        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onLoad: function (context) {
            let formContext = context.getFormContext();

            if (!!formContext) {
                let phoneControl = formContext.getControl("nav_phone");
                if (!!phoneControl) {
                    phoneControl.setVisible(false);
                }
                else alert("try to get nav_phone control, but get null");

                let emailControl = formContext.getControl("nav_email");
                if (!!emailControl) {
                    emailControl.setVisible(false);
                }
                else alert("try to get nav_email control, but get null");

                let typeAttr = formContext.getAttribute("nav_type");

                if (!!typeAttr) {
                    onTypeChanged(context);
                    typeAttr.addOnChange(onTypeChanged);
                }
                else alert("try to get nav_type attr, but get null");
            }
            else alert("try to get formContext control, but get null");
        }
    }
})();