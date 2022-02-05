using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Query;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Test.Plugins.nav_communication.Handlers
{
    public class Nav_communicationService
    {
        private readonly IOrganizationService service;

        public Nav_communicationService(IOrganizationService service)
        {
            this.service = service ?? throw new ArgumentNullException(nameof(service));
        }

        public void CheckIsMainCommunicationSingle(Entity targetEntity)
        {
            OptionSetValue type;
            bool isMain;
            EntityReference contactRef;

            if (targetEntity.Contains("nav_type"))
            {
                type = targetEntity.GetAttributeValue<OptionSetValue>("nav_type");
            }
            else
            {
                var communicationId = targetEntity.Id;

                var communication = service.Retrieve("nav_communication", communicationId, new ColumnSet("nav_type"));

                if (!communication.Contains("nav_type"))
                {
                    return;
                }
                type = communication.GetAttributeValue<OptionSetValue>("nav_type");
            }

            if (targetEntity.Contains("nav_main"))
            {
                isMain = targetEntity.GetAttributeValue<bool>("nav_main");
            }
            else
            {
                var communicationId = targetEntity.Id;

                var communication = service.Retrieve("nav_communication", communicationId, new ColumnSet("nav_main"));

                if (!communication.Contains("nav_main"))
                {
                    return;
                }
                isMain = communication.GetAttributeValue<bool>("nav_main");
            }

            if (targetEntity.Contains("nav_contactid"))
            {
                contactRef = targetEntity.GetAttributeValue<EntityReference>("nav_contactid");
            }
            else
            {
                var communicationId = targetEntity.Id;

                var communication = service.Retrieve("nav_communication", communicationId, new ColumnSet("nav_contactid"));

                if (!communication.Contains("nav_contactid"))
                {
                    return;
                }
                contactRef = communication.GetAttributeValue<EntityReference>("nav_contactid");
            }

            var contactId = contactRef.Id;

            var mainCommunicationsForContactQuery = new QueryExpression
            {
                EntityName = "nav_communication",
                ColumnSet = new ColumnSet("nav_communicationid"),
                Criteria = new FilterExpression
                {
                    Conditions =
                    {
                        new ConditionExpression
                        {
                            AttributeName = "nav_communicationid",
                            Operator = ConditionOperator.NotEqual,
                            Values = {targetEntity.Id}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_contactid",
                            Operator = ConditionOperator.Equal,
                            Values ={contactId}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_type",
                            Operator = ConditionOperator.Equal,
                            Values ={type.Value}
                        },
                        new ConditionExpression
                        {
                            AttributeName = "nav_main",
                            Operator = ConditionOperator.Equal,
                            Values ={isMain}
                        }
                    }
                }
            };

            DataCollection<Entity> mainCommunicationsForContact = service.RetrieveMultiple(mainCommunicationsForContactQuery).Entities;

            if (mainCommunicationsForContact.Count() > 0)
            {
                throw new Exception("Основное средство связи с таким типом уже существует для выбранного контакта!");
            }
        }
    }
}
