// src/plugins/otel.js

import { WebTracerProvider } from '@opentelemetry/sdk-trace-web';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-http';
import { ZoneContextManager } from '@opentelemetry/context-zone';
import { B3Propagator } from '@opentelemetry/propagator-b3';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { DocumentLoadInstrumentation } from '@opentelemetry/instrumentation-document-load';
import { UserInteractionInstrumentation } from '@opentelemetry/instrumentation-user-interaction';
import { XMLHttpRequestInstrumentation } from '@opentelemetry/instrumentation-xml-http-request';
import { FetchInstrumentation } from '@opentelemetry/instrumentation-fetch';

// ✅ 直接使用 plain object 作为 resource（完全合法！）
const resource = {
  attributes: {
    'service.name': 'cloud-web',
    // 可选：添加其他属性
    // 'telemetry.sdk.name': 'opentelemetry',
    // 'telemetry.sdk.language': 'webjs'
  }
};

const exporter = new OTLPTraceExporter({
  url: import.meta.env.VITE_OTEL_ENDPOINT,
});

const provider = new WebTracerProvider({ resource }); // 👈 直接传入

provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

provider.register({
  contextManager: new ZoneContextManager(),
  propagator: new B3Propagator(),
});

registerInstrumentations({
  instrumentations: [
    new DocumentLoadInstrumentation(),
    new UserInteractionInstrumentation(),
    new XMLHttpRequestInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/g,
    }),
    new FetchInstrumentation({
      propagateTraceHeaderCorsUrls: /.*/g,
    }),
  ],
});

export const tracer = provider.getTracer('cloud-web');

console.log('✅ OpenTelemetry initialized (without Resource constructor)');
