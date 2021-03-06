using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Test.Plugins.nav_agreement.Handlers;

namespace Test.Plugins.nav_agreement
{
    public sealed class PreNav_agreementUpdate:IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {

            var traceService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var targetEntity = (Entity)pluginContext.InputParameters["Target"];
            var preAgreementImage = (Entity)pluginContext.PreEntityImages["PreAgreementImage"];

            if (preAgreementImage == null)
            {
                traceService.Trace("Не смог получить PreAgreementImage");
                throw new InvalidPluginExecutionException("Не смог получить PreAgreementImage");
            }

            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(Guid.Empty);

            try
            {
                Nav_agreementService nav_agreementService = new Nav_agreementService(service, traceService);
                nav_agreementService.SetFactTrueIfSummaEqualFactSumma(targetEntity,preAgreementImage);
            }
            catch (Exception ex)
            {
                traceService.Trace(ex.ToString());

                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
