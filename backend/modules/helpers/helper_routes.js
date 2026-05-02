'use strict';

function normalizeMethod(method) {
  const value = String(method || '').trim().toLowerCase();
  if (!value) throw new Error('Route-Methode fehlt.');
  return value;
}

function normalizeRoutes(routes) {
  const list = Array.isArray(routes) ? routes : [routes];
  const clean = [];

  for (const route of list) {
    const value = String(route || '').trim();
    if (!value) continue;
    if (!value.startsWith('/')) throw new Error(`Route muss mit / beginnen: ${value}`);
    if (!clean.includes(value)) clean.push(value);
  }

  if (clean.length === 0) throw new Error('Mindestens eine Route muss angegeben werden.');
  return clean;
}

function registerRoute(app, method, routes, handler, ...middlewares) {
  if (!app) throw new Error('Express app fehlt.');
  if (typeof handler !== 'function') throw new Error('Route-Handler fehlt oder ist keine Funktion.');

  const verb = normalizeMethod(method);
  if (typeof app[verb] !== 'function') throw new Error(`Express Methode nicht unterstützt: ${verb}`);

  const routeList = normalizeRoutes(routes);
  for (const route of routeList) app[verb](route, ...middlewares, handler);
  return routeList;
}

function registerGet(app, routes, handler, ...middlewares) {
  return registerRoute(app, 'get', routes, handler, ...middlewares);
}

function registerPost(app, routes, handler, ...middlewares) {
  return registerRoute(app, 'post', routes, handler, ...middlewares);
}

function registerPut(app, routes, handler, ...middlewares) {
  return registerRoute(app, 'put', routes, handler, ...middlewares);
}

function registerDelete(app, routes, handler, ...middlewares) {
  return registerRoute(app, 'delete', routes, handler, ...middlewares);
}

function legacyPair(legacyRoute, apiRoute) {
  const routes = [];
  if (legacyRoute) routes.push(legacyRoute);
  if (apiRoute && apiRoute !== legacyRoute) routes.push(apiRoute);
  return normalizeRoutes(routes);
}

module.exports = {
  registerRoute,
  registerGet,
  registerPost,
  registerPut,
  registerDelete,
  legacyPair,
  normalizeRoutes,
  normalizeMethod
};
