﻿using Microsoft.Xrm.Sdk;
using Microsoft.Xrm.Sdk.Workflow;
using System;
using System.Activities;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Test.Workflows.nav_agreement.Handlers;

namespace Test.Workflows.nav_agreement
{
    public class Nav_agreementCheckInvoiceExistingActivity : CodeActivity
    {
        [Input("Nav_agreement")]
        [RequiredArgument]
        [ReferenceTarget("nav_agreement")]
        public InArgument<EntityReference> Nav_agreementReference { get; set; }

        [Output("Is exist invoice connected with current agreement")]
        public OutArgument<bool> IsInvoiceExist { get; set; }

        protected override void Execute(CodeActivityContext context)
        {
            var wfContext = context.GetExtension<IWorkflowContext>();
            var serviceFactory = context.GetExtension<IOrganizationServiceFactory>();
            var traceService = context.GetExtension<ITracingService>();
            var service = serviceFactory.CreateOrganizationService(null);

            var agreementRef = Nav_agreementReference.Get(context);

            try
            {
                Nav_agreementService nav_agreementService = new Nav_agreementService(service);
                IsInvoiceExist.Set(context, nav_agreementService.IsInvoiceExisting(agreementRef));
            }
            catch (Exception ex)
            {
                traceService.Trace(ex.ToString());

                throw new InvalidWorkflowException(ex.Message);
            }
        }
    }
}
