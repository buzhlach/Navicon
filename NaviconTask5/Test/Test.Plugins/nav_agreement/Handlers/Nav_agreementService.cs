using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test.Plugins.nav_agreement.Handlers
{
    public class Nav_agreementService
    {
        private readonly IOrganizationService service;
        private readonly ITracingService tracingService;

        public Nav_agreementService(IOrganizationService service, ITracingService tracingService)
        {
            this.service = service ?? throw new ArgumentNullException(nameof(service));
            this.tracingService = tracingService ?? throw new ArgumentException(nameof(service));
        }

        /// <summary>
        /// Устанавливает дату первого договора в связанный контакт, если это поле не пусто.
        /// </summary>
        /// <param name="targetEntity"></param>
        /// <exception cref="InvalidPluginExecutionException"></exception>
        public void SetContactFirstAgreementDate(Entity targetEntity)
        {
            var contactRef = targetEntity.GetAttributeValue<EntityReference>("nav_contact");
            var agreementDate = targetEntity.GetAttributeValue<DateTime>("nav_date");

            if ((contactRef == null) || (agreementDate == null))
            {
                tracingService.Trace("Пытался получить контакт и дату договора, но значение не найдено.");
                throw new InvalidPluginExecutionException(nameof(contactRef));
            }

            var contactId = contactRef.Id;

            var contact = service.Retrieve("contact", contactId, new ColumnSet("nav_date"));

            if (contact.Contains("nav_date"))
            {
                return;
            }

            contact["nav_date"] = agreementDate.Date;
            service.Update(contact);
        }

        /// <summary>
        /// Устанавливает статус Оплачен, если оплаченная сумма сравнялась с суммой договора с кредитом.
        /// </summary>
        /// <param name="targetEntity"></param>
        /// <param name="preAgreemenetImage"></param>
        public void SetFactTrueIfSummaEqualFactSumma(Entity targetEntity, Entity preAgreemenetImage = null)
        {
            decimal fullCreditSum = Decimal.Zero;
            decimal fullSum = Decimal.Zero;
            decimal factSum = Decimal.Zero;

            if(preAgreemenetImage == null)
            {
                fullCreditSum = targetEntity.GetAttributeValue<Money>("nav_fullcreditamount")?.Value ?? Decimal.Zero;
                fullSum = targetEntity.GetAttributeValue<Money>("nav_summa")?.Value ?? Decimal.Zero;
                factSum = targetEntity.GetAttributeValue<Money>("nav_factsumma")?.Value ?? Decimal.Zero;
            }
            
            else
            {
                fullCreditSum = (targetEntity.Contains("nav_fullcreditamount"))
                    ? targetEntity.GetAttributeValue<Money>("nav_fullcreditamount")?.Value ?? Decimal.Zero
                    : preAgreemenetImage.GetAttributeValue<Money>("nav_fullcreditamount")?.Value ?? Decimal.Zero;
                fullSum = (targetEntity.Contains("nav_summa"))
                    ? targetEntity.GetAttributeValue<Money>("nav_summa")?.Value ?? Decimal.Zero
                    : preAgreemenetImage.GetAttributeValue<Money>("nav_summa")?.Value ?? Decimal.Zero;
                factSum = (targetEntity.Contains("nav_factsumma"))
                    ? targetEntity.GetAttributeValue<Money>("nav_factsumma")?.Value ?? Decimal.Zero
                    : preAgreemenetImage.GetAttributeValue<Money>("nav_factsumma")?.Value ?? Decimal.Zero;
            }
            targetEntity["nav_fact"] = (fullCreditSum > fullSum)
                ? (Decimal.Round(factSum, 2) == Decimal.Round(fullCreditSum, 2))
                : (Decimal.Round(factSum, 2) == Decimal.Round(fullSum, 2));
        }
    }
}
