using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Test.Plugins.nav_communication.Handlers;

namespace Test.Plugins.nav_communication
{
    public sealed class PreNav_communicationUpdate:IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {

            var traceService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var targetEntity = (Entity)pluginContext.InputParameters["Target"];

            var preCommunicationImage = (Entity)pluginContext.PreEntityImages["PreCommunicationImage"];

            if (preCommunicationImage == null)
            {
                traceService.Trace("Не смог получить PreCommunicationImage");
                throw new InvalidPluginExecutionException("Не смог получить PreCommunicationImage");
            }

            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(Guid.Empty);

            try
            {
                Nav_communicationService nav_communicationService = new Nav_communicationService(service);
                nav_communicationService.CheckIsMainCommunicationSingle(targetEntity,preCommunicationImage);
            }
            catch (Exception ex)
            {
                traceService.Trace(ex.ToString());

                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
