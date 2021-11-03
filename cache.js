function getCachedEvents(until) {
  const value = CacheService.getScriptCache().get(keyForUntil(until));
  return value ? JSON.parse(value) : undefined;
}

function cacheEvents(until, events) {
  const key = keyForUntil(until);
  CacheService.getScriptCache().put(key, JSON.stringify(events));
  updateEventsKeys(key);
}

function clearEventsCache() {
  CacheService.getScriptCache().removeAll(getEventsCacheKeys());
}

function keyForUntil(until) {
  return `events-${until}`;
}

function getEventsCacheKeys() {
  return JSON.parse(CacheService.getScriptCache().get('until-keys') || '[]');
}

function putEventsCacheKeys(keys) {
  CacheService.getScriptCache().put('until-keys', JSON.stringify(keys));
}

function updateEventsKeys(key) {
  putEventsCacheKeys(getEventsCacheKeys().concat([key]));
}
