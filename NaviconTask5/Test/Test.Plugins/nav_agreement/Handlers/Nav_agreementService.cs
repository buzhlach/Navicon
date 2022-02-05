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

        public void SetContactFirstAgreementDate(Entity targetEntity)
        {
            var contactRef = targetEntity.GetAttributeValue<EntityReference>("nav_contact");
            var agreementDate = targetEntity.GetAttributeValue<DateTime>("nav_date");

            if ((contactRef == null) || (agreementDate == null))
            {
                tracingService.Trace("Пытался получить контакт и дату договора, но значение не найдено.");
                throw new NullReferenceException(nameof(contactRef));
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

        public void SetFactTrueIfSummaEqualFactSumma(Entity targetEntity)
        {
            decimal fullSum = Decimal.Zero;
            decimal factSum = Decimal.Zero;

            if (targetEntity.Contains("nav_fullcreditamount"))
            {
                fullSum = (decimal)targetEntity.GetAttributeValue<Money>("nav_fullcreditamount").Value;
            }
            else
            {
                var targetId = targetEntity.Id;

                var agreement = service.Retrieve("nav_agreement", targetId, new ColumnSet("nav_fullcreditamount","nav_summa"));

                if (!agreement.Contains("nav_fullcreditamount"))
                {
                    if (targetEntity.Contains("nav_summa"))
                    {
                        fullSum = (decimal)targetEntity.GetAttributeValue<Money>("nav_summa").Value;
                    }
                    else
                    {

                        if (agreement.Contains("nav_summa"))
                        {
                            fullSum = (decimal)agreement.GetAttributeValue<Money>("nav_fullcreditamount").Value;
                        }
                    }
                }
                else
                {
                    fullSum = (decimal)agreement.GetAttributeValue<Money>("nav_fullcreditamount").Value;
                }
            }

            if (targetEntity.Contains("nav_factsumma"))
            {
                factSum = (decimal)targetEntity.GetAttributeValue<Money>("nav_factsumma").Value;
            }
            else
            {
                var targetId = targetEntity.Id;

                var agreement = service.Retrieve("nav_agreement", targetId, new ColumnSet("nav_factsumma"));

                if (agreement.Contains("nav_factsumma"))
                {
                    factSum = (decimal)agreement.GetAttributeValue<Money>("nav_factsumma").Value;
                }
            }
            targetEntity["nav_fact"] = (Decimal.Round(factSum,2) == Decimal.Round(fullSum,2));
        }
    }
}
