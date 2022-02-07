using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test.Plugins.nav_invoice.Handlers
{
    public class Nav_invoiceService
    {
        private readonly IOrganizationService service;

        public Nav_invoiceService(IOrganizationService service)
        {
            this.service = service ?? throw new ArgumentNullException(nameof(service));
        }

        public void SetNav_typeIfNull(Entity targetEntity)
        {
            var type = targetEntity.GetAttributeValue<OptionSetValue>("nav_type");
            if (type != null)
            {
                return;
            }

            int manually = 0;
            type = new OptionSetValue(manually);
            targetEntity["nav_type"] = type;
        }

        private void AddToNav_agreementFactSumma(Guid agreementId, decimal addedSum)
        {
            var agreement = service.Retrieve("nav_agreement", agreementId, new ColumnSet("nav_factsumma"));

            var factSum =  agreement.GetAttributeValue<Money>("nav_factsumma")?.Value ?? Decimal.Zero;

            factSum += addedSum;

            agreement["nav_factsumma"] = new Money(factSum);
            service.Update(agreement);
        }

        public void RecalculateFactSummaInNav_agreement(Entity targetEntity, bool isOnUpdate = false,bool isOnDelete = false)
        {
            if (!targetEntity.Contains("nav_fact"))
            {
                return;
            }

            var fact = targetEntity.GetAttributeValue<bool>("nav_fact");
            var agreementRef = targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid");
            var amount = targetEntity.GetAttributeValue<Money>("nav_amount")?.Value ?? Decimal.Zero;

            if ((agreementRef==null)) {
                return;
            }

            if (fact)
            {
                if (isOnDelete)
                {
                    AddToNav_agreementFactSumma(agreementRef.Id, -amount);
                }
                else
                {
                    AddToNav_agreementFactSumma(agreementRef.Id, amount);
                }
            }
            else if (isOnUpdate)
            {
                AddToNav_agreementFactSumma(agreementRef.Id, -amount);
            }
        }


        public void CheckIsAgreementFactSumOverpayed(Entity targetEntity, Entity preUpdateAgreementImage=null)
        {
            var fact = false;
            EntityReference agreementRef = default(EntityReference);
            decimal amount = Decimal.Zero;

            if (preUpdateAgreementImage == null)
            {
                if (!targetEntity.Contains("nav_fact"))
                {
                    return;
                }

                fact = targetEntity.GetAttributeValue<bool>("nav_fact");
                agreementRef = targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid");
                amount = targetEntity.GetAttributeValue<Money>("nav_amount")?.Value ?? Decimal.Zero;
            }
            else
            {
                if (!targetEntity.Contains("nav_fact") && !preUpdateAgreementImage.Contains("nav_fact"))
                {
                    return;
                }

                fact = (targetEntity.Contains("nav_fact"))
                    ? targetEntity.GetAttributeValue<bool>("nav_fact")
                    : preUpdateAgreementImage.GetAttributeValue<bool>("nav_fact");
                agreementRef = (targetEntity.Contains("nav_dogovorid"))
                    ? targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid")
                    : targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid");
                amount = (targetEntity.Contains("nav_amount"))
                    ? targetEntity.GetAttributeValue<Money>("nav_amount")?.Value ?? Decimal.Zero
                    : preUpdateAgreementImage.GetAttributeValue<Money>("nav_amount")?.Value ?? Decimal.Zero;
            }

            if (!fact || agreementRef==null)
            {
                return;
            }

            var agreement = service.Retrieve("nav_agreement", agreementRef.Id, new ColumnSet("nav_factsumma","nav_fullcreditamount","nav_summa"));

            var factSum = agreement.GetAttributeValue<Money>("nav_factsumma")?.Value ?? Decimal.Zero;

            var allSum = (agreement.Contains("nav_fullcreditamount"))
                ? agreement.GetAttributeValue<Money>("nav_fullcreditamount")?.Value ?? Decimal.Zero
                : agreement.GetAttributeValue<Money>("nav_summa")?.Value ?? Decimal.Zero;

            if (factSum + amount > allSum)
            {
                throw new Exception("Сумма всех оплаченных счетов больше суммы для оплаты!");
            }

            targetEntity["nav_paydate"] = DateTime.Today;
        }
    }
}
