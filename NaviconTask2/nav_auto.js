var Navicon = Navicon || {};

Navicon.nav_auto = (function () {
    let onUsedChanged = function(context){
        let formContext = context.getFormContext();

        let usedValue = formContext.getAttribute("nav_used")
            .getValue();

        let kmControl = formContext.getControl("nav_km");
        let ownersCountControl = formContext.getControl("nav_ownerscount");
        let isDamagedControl = formContext.getControl("nav_isdamaged");

        if (usedValue) {
            if (!!kmControl && !!ownersCountControl && !!isDamagedControl) {
                kmControl.setVisible(true);
                ownersCountControl.setVisible(true);
                isDamagedControl.setVisible(true)
            }
            else alert("try to get nav_ownerscount, nav_km, nav_isdamaged attr, but get null");
        }
        else {
            if (!!kmControl && !!ownersCountControl && !!isDamagedControl) {
                kmControl.setVisible(false);
                ownersCountControl.setVisible(false);
                isDamagedControl.setVisible(false)
            }
            else alert("try to get nav_ownerscount, nav_km, nav_isdamaged attr, but get null");
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
                let kmControl = formContext.getControl("nav_km");
                if (!!kmControl) {
                    kmControl.setVisible(false);
                }
                else alert("try to get nav_km control, but get null");

                let ownersCountControl = formContext.getControl("nav_ownerscount");
                if (!!ownersCountControl) {
                    ownersCountControl.setVisible(false);
                }
                else alert("try to get nav_ownerscount control, but get null");

                let isDamagedControl = formContext.getControl("nav_isdamaged");
                if (!!isDamagedControl) {
                    isDamagedControl.setVisible(false);
                }
                else alert("try to get nav_isdamaged control, but get null");

                let usedAttr = formContext.getAttribute("nav_used");

                if (!!usedAttr) {
                    onUsedChanged(context);
                    usedAttr.addOnChange(onUsedChanged);
                }
                else alert("try to get nav_type attr, but get null");
            }
            else alert("try to get formContext control, but get null");
        }
    }
})();