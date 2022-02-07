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

        /// <summary>
        /// Проверяет существует ли у связанного контакта средство связи с таким же типом и значением основной.
        /// </summary>
        /// <param name="targetEntity"></param>
        /// <param name="preCommunicationImage"></param>
        /// <exception cref="InvalidPluginExecutionException">Существует основное средство связи аналогичного типа</exception>
        public void CheckIsMainCommunicationSingle(Entity targetEntity, Entity preCommunicationImage = null)
        {
            OptionSetValue type = default(OptionSetValue);
            bool isMain = false;
            EntityReference contactRef = default(EntityReference);

            if (preCommunicationImage == null)
            {
                if (!targetEntity.Contains("nav_main"))
                {
                    return;
                }

                type = targetEntity.GetAttributeValue<OptionSetValue>("nav_type");
                isMain = targetEntity.GetAttributeValue<bool>("nav_main");
                contactRef = targetEntity.GetAttributeValue<EntityReference>("nav_contactid");
            }
            else
            {
                if (!targetEntity.Contains("nav_main") && !preCommunicationImage.Contains("nav_main"))
                {
                    return;
                }

                type = (targetEntity.Contains("nav_type"))
                    ? targetEntity.GetAttributeValue<OptionSetValue>("nav_type")
                    : preCommunicationImage.GetAttributeValue<OptionSetValue>("nav_type");
                isMain = targetEntity.GetAttributeValue<bool>("nav_main");
                contactRef = (targetEntity.Contains("nav_contactid"))
                    ? targetEntity.GetAttributeValue<EntityReference>("nav_contactid")
                    : preCommunicationImage.GetAttributeValue<EntityReference>("nav_contactid");
            }

            if ((type == null) || (contactRef == null))
            {
                return;
            }

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
                            Values ={contactRef.Id}
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
                throw new InvalidPluginExecutionException("Основное средство связи с таким типом уже существует для выбранного контакта!");
            }
        }
    }
}
