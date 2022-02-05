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

            var factSum = (agreement.Contains("nav_factsumma")) ?
                (decimal) agreement.GetAttributeValue<Money>("nav_factsumma").Value :
                Decimal.Zero;

            factSum += addedSum;

            agreement["nav_factsumma"] = new Money(factSum);
            service.Update(agreement);

        }

        public void RecalculateFactSummaInNav_agreementOnCreate(Entity targetEntity)
        {
            if (!targetEntity.Contains("nav_fact")|| !targetEntity.Contains("nav_amount"))
            {
                return;
            }

            var fact = targetEntity.GetAttributeValue<bool>("nav_fact");
            var agreementRef = targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid");
            var amount = (decimal)targetEntity.GetAttributeValue<Money>("nav_amount").Value;

            if (!fact || (agreementRef==null)) {
                return;
            }

            var agreementId = agreementRef.Id;
            AddToNav_agreementFactSumma(agreementId, amount);
        }

        public void RecalculateFactSummaInNav_agreementOnUpdate(Entity targetEntity)
        {
            if (!targetEntity.Contains("nav_fact"))
            {
                return;
            }

            var fact = targetEntity.GetAttributeValue<bool>("nav_fact");
            var invoiceId = targetEntity.Id;

            var invoice = service.Retrieve("nav_invoice", invoiceId, new ColumnSet("nav_amount","nav_dogovorid"));

            var agreementRef = invoice.GetAttributeValue<EntityReference>("nav_dogovorid");

            if ((agreementRef == null)||!invoice.Contains("nav_amount"))
            {
                return;
            }
            var amount = (decimal)invoice.GetAttributeValue<Money>("nav_amount").Value;

            var agreementId = agreementRef.Id;

            if (fact)
            {
                AddToNav_agreementFactSumma(agreementId, amount);
            }
            else
            {
                AddToNav_agreementFactSumma(agreementId, -amount);
            }
            
        }

        public void RecalculateFactSummaInNav_agreementOnDelete(EntityReference targetEntityRef)
        { 

            var targetEntityId = targetEntityRef.Id;

            var invoice = service.Retrieve("nav_invoice", targetEntityId, new ColumnSet("nav_amount", "nav_dogovorid", "nav_fact"));

            if (!invoice.Contains("nav_fact")|| !invoice.Contains("nav_amount"))
            {
                return;
            }

            var fact = invoice.GetAttributeValue<bool>("nav_fact");
            var amount = (decimal)invoice.GetAttributeValue<Money>("nav_amount").Value;
            var agreementRef = invoice.GetAttributeValue<EntityReference>("nav_dogovorid");
            

            if (!fact || (agreementRef == null))
            {
                return;
            }

            var agreementId = agreementRef.Id;
            AddToNav_agreementFactSumma(agreementId, -amount);
        }

        public void CheckIsAgreementFactSumOverpayed(Entity targetEntity)
        {
            if (!targetEntity.Contains("nav_fact"))
            {
                return;
            }

            var fact = targetEntity.GetAttributeValue<bool>("nav_fact");
            EntityReference agreementRef;
            decimal amount = Decimal.Zero;

            if (!fact)
            {
                return;
            }

            if (targetEntity.Contains("nav_dogovorid"))
            {
                agreementRef = targetEntity.GetAttributeValue<EntityReference>("nav_dogovorid");
            }
            else
            {
                var invoiceId = targetEntity.Id;

                var invoice = service.Retrieve("nav_invoice", invoiceId, new ColumnSet("nav_dogovorid"));

                if (!invoice.Contains("nav_dogovorid"))
                {
                    return;
                }
                agreementRef = invoice.GetAttributeValue<EntityReference>("nav_dogovorid");
            }

            if (targetEntity.Contains("nav_amount"))
            {
                amount = (decimal)targetEntity.GetAttributeValue<Money>("nav_amount").Value;
            }
            else
            {
                var invoiceId = targetEntity.Id;

                var invoice = service.Retrieve("nav_invoice", invoiceId, new ColumnSet("nav_amount"));

                if (!invoice.Contains("nav_amount"))
                {
                    return;
                }
                amount = (decimal)invoice.GetAttributeValue<Money>("nav_amount").Value;

            }

            var agreementId = agreementRef.Id;

            var agreement = service.Retrieve("nav_agreement", agreementId, new ColumnSet("nav_factsumma","nav_fullcreditamount","nav_summa"));

            var factSum = (agreement.Contains("nav_factsumma")) ?
                (decimal)agreement.GetAttributeValue<Money>("nav_factsumma").Value :
                Decimal.Zero;

            decimal allSum = Decimal.Zero;

            if (agreement.Contains("nav_fullcreditamount"))
            {
                allSum = (decimal)agreement.GetAttributeValue<Money>("nav_fullcreditamount").Value;
            }
            else if (agreement.Contains("nav_summa"))
            {
                allSum = (decimal)agreement.GetAttributeValue<Money>("nav_summa").Value;
            }

            if (factSum + amount > allSum)
            {
                throw new Exception("Сумма всех оплаченных счетов больше суммы для оплаты!");
            }

            targetEntity["nav_paydate"] = DateTime.Today;
        }
    }
}
