var Navicon = Navicon || {};

Navicon.nav_auto = (function () {
    /**
     * Если поле С пробегом true, то открывает поля, связанные с пробегом.
     * @param {*} context 
     */
    let onUsedChanged = function (context) {
        let formContext = context.getFormContext();

        let usedValue = formContext.getAttribute("nav_used").getValue();
        changeControlVisible(context, ["nav_km", "nav_ownerscount", "nav_isdamaged"], usedValue);
    }

    /**
* Меняет видимость у control именам controlNames.
* @param {*} context 
* @param {Array} controlNames Имена всех control.
* @param {boolean} visible Параметр видимости.
*/
    let changeControlVisible = function (context, controlNames, visible) {
        controlNames.forEach(element => {
            let formContext = context.getFormContext();
            let disableControl = formContext.getControl(element);

            if (disableControl) {
                disableControl.setVisible(visible);
            }
            else {
                console.log("try to get" + element + "control ,but get null");
            }
        });
    }

    return {

        /**
         * Выполняется при загрузке формы.
         * @param {*} context 
         */
        onLoad: function (context) {
            let formContext = context.getFormContext();

            if (!formContext) {
                alert("try to get formContext control, but get null");
                return;
            }

            changeControlVisible(context, ["nav_km", "nav_ownerscount", "nav_isdamaged"], false);

            let usedAttr = formContext.getAttribute("nav_used");

            if (usedAttr) {
                onUsedChanged(context);
                usedAttr.addOnChange(onUsedChanged);
            }
            else {
                alert("try to get nav_type attr, but get null");
            }
        }
    }
})();