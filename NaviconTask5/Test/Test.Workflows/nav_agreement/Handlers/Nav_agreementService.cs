using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test.Workflows.nav_agreement.Handlers
{
    public class Nav_agreementService
    {
        private readonly IOrganizationService service;

        public Nav_agreementService(IOrganizationService service)
        {
            this.service = service ?? throw new ArgumentNullException(nameof(service));
        }

        public bool IsInvoiceExisting(EntityReference agreementRef)
        {
            if(agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreementInvoicesQuery = new QueryExpression
            {
                EntityName = "nav_invoice",
                ColumnSet = new ColumnSet("nav_invoiceid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                            AttributeName = "nav_dogovorid",
                            Operator = ConditionOperator.Equal,
                            Values = {agreementId}
                        }
                    }
                }
            };

            DataCollection<Entity> agreementInvoices = service.RetrieveMultiple(agreementInvoicesQuery).Entities;

            return (agreementInvoices.Count() > 0);
        }

        public bool IsPaidInvoiceExisting(EntityReference agreementRef)
        {
            if (agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreementInvoicesQuery = new QueryExpression
            {
                EntityName = "nav_invoice",
                ColumnSet = new ColumnSet("nav_invoiceid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                            AttributeName = "nav_dogovorid",
                            Operator = ConditionOperator.Equal,
                            Values = {agreementId}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_fact",
                            Operator = ConditionOperator.Equal,
                            Values = {true}
                        }
                    }
                }
            };

            DataCollection<Entity> agreementInvoices = service.RetrieveMultiple(agreementInvoicesQuery).Entities;

            return (agreementInvoices.Count() > 0);
        }

        public bool IsManuallyInvoiceExisting(EntityReference agreementRef)
        {
            if (agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreementInvoicesQuery = new QueryExpression
            {
                EntityName = "nav_invoice",
                ColumnSet = new ColumnSet("nav_invoiceid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                            AttributeName = "nav_dogovorid",
                            Operator = ConditionOperator.Equal,
                            Values = {agreementId}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_type",
                            Operator = ConditionOperator.Equal,
                            Values = {0}
                        }
                    }
                }
            };

            DataCollection<Entity> agreementInvoices = service.RetrieveMultiple(agreementInvoicesQuery).Entities;

            return (agreementInvoices.Count() > 0);
        }

        public void DeleteAllAutoInvoices(EntityReference agreementRef)
        {
            if (agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreementInvoicesQuery = new QueryExpression
            {
                EntityName = "nav_invoice",
                ColumnSet = new ColumnSet("nav_invoiceid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                            AttributeName = "nav_dogovorid",
                            Operator = ConditionOperator.Equal,
                            Values = {agreementId}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_type",
                            Operator = ConditionOperator.Equal,
                            Values = {1}
                        }
                    }
                }
            };

            DataCollection<Entity> agreementInvoices = service.RetrieveMultiple(agreementInvoicesQuery).Entities;

            if (agreementInvoices.Count() < 1)
            {
                return;
            }

            foreach(var invoice in agreementInvoices)
            {
                service.Delete("nav_invoice", invoice.Id);
            }
        }

        public void CreatePayPlan(EntityReference agreementRef)
        {
            if (agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreement = service.Retrieve(agreementRef.LogicalName, agreementId, new ColumnSet("nav_creditperiod", "nav_creditamount"));

            if (!agreement.Contains("nav_creditperiod") || !agreement.Contains("nav_creditamount"))
            {
                return;
            }

            var creditPeriodMonths = 12*agreement.GetAttributeValue<int>("nav_creditperiod");
            var creditAmountPerMonth = ((decimal)agreement.GetAttributeValue<Money>("nav_creditamount").Value) / (decimal)creditPeriodMonths;

            for (int i = 0; i < creditPeriodMonths; i++)
            {
                var paydate = new DateTime(DateTime.Today.AddMonths(i + 1).Year, DateTime.Today.AddMonths(i + 1).Month, 1);

                var invoice = new Entity("nav_invoice");
                invoice["nav_name"] = "Автоматический счет по плану оплаты";
                invoice["nav_amount"] = new Money(creditAmountPerMonth);
                invoice["nav_date"] = paydate;
                invoice["nav_dogovorid"] = agreementRef;
                invoice["nav_fact"] = false;
                invoice["nav_paydate"] = paydate;
                invoice["nav_type"] = new OptionSetValue(1);

                service.Create(invoice);
            }
        }

        public void SetAgreementPayPlanDate(EntityReference agreementRef)
        {
            if (agreementRef == null)
            {
                throw new ArgumentNullException(nameof(agreementRef));
            }

            var agreementId = agreementRef.Id;

            var agreement = new Entity("nav_agreement", agreementId);
            agreement["nav_paymentplandate"] = DateTime.Today.AddDays(1);

            service.Update(agreement);
        }
    }
}
