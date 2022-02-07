using Microsoft.Xrm.Sdk;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Test.Plugins.nav_invoice.Handlers;

namespace Test.Plugins.nav_invoice
{
    public sealed class PreNav_invoiceDelete: IPlugin
    {
        public void Execute(IServiceProvider serviceProvider)
        {

            var traceService = (ITracingService)serviceProvider.GetService(typeof(ITracingService));
            var pluginContext = (IPluginExecutionContext)serviceProvider.GetService(typeof(IPluginExecutionContext));
            var targetEntityRef = (EntityReference)pluginContext.InputParameters["Target"];

            var preDeleteInvoiceImage = (Entity)pluginContext.PreEntityImages["PreDeleteInvoiceImage"];

            if (preDeleteInvoiceImage == null)
            {
                traceService.Trace("Не смог получить PreDeleteInvoiceImage");
                throw new InvalidPluginExecutionException("Не смог получить PreDeleteInvoiceImage");
            }

            var serviceFactory = (IOrganizationServiceFactory)serviceProvider.GetService(typeof(IOrganizationServiceFactory));
            var service = serviceFactory.CreateOrganizationService(Guid.Empty);

            try
            {
                Nav_invoiceService nav_invoiceService = new Nav_invoiceService(service);
                nav_invoiceService.RecalculateFactSummaInNav_agreement(preDeleteInvoiceImage,false,true);
            }
            catch (Exception ex)
            {
                traceService.Trace(ex.ToString());

                throw new InvalidPluginExecutionException(ex.Message);
            }
        }
    }
}
