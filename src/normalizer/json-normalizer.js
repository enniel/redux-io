import _ from 'lodash';
import { getTransformation } from '../status';

// Ignored properties are passed from store so they can not be Set
const DEFAULT_IGNORED_PROPERTIES = { id: true, type: true };

function createNormalizedJsonItemDescription(denormalizedItem) {
  return {
    id: denormalizedItem.id,
    type: denormalizedItem.type,
    attributes: {},
    relationships: {},
  };
}

function createRelationshipItemDescriptor(relationshipItem) {
  return { id: relationshipItem.id, type: relationshipItem.type };
}

function normalizeRelationshipArray(relationshipArray) {
  return _.reduce(relationshipArray, (normalizeRelationshipArray, relationshipItem) => {
    normalizeRelationshipArray.push(createRelationshipItemDescriptor(relationshipItem));
    return normalizeRelationshipArray;
  }, []);
}

function normalizeRelationshipObject(relationshipItem) {
  return createRelationshipItemDescriptor(relationshipItem);
}

function isIgnoredProperty(property, ignoredProperties = DEFAULT_IGNORED_PROPERTIES) {
  return !!ignoredProperties[property];
}

export function normalizeItem(item) {
  return _.reduce(item, (normalizedItem, val, property) => {
    const itemTransformation = getTransformation(item);

    if (!itemTransformation || isIgnoredProperty(property)) {
      return normalizedItem;
    }

    const relationshipItem = itemTransformation.relationshipProperties[property] && val;
    if (relationshipItem) {
      if (_.isArray(relationshipItem)) {
        normalizedItem.relationships[property] = {
          data: normalizeRelationshipArray(relationshipItem),
        };
      } else if (_.isPlainObject(relationshipItem)) {
        normalizedItem.relationships[property] = {
          data: normalizeRelationshipObject(relationshipItem),
        };
      } else {
        // this should generally be case when relationship does not exists
        // if relationship is not provided (included) it is little bit tricky NOW..
        normalizedItem.relationships[property] = { data: null };
      }
    } else {
      normalizedItem.attributes[property] = val;
    }

    return normalizedItem;
  }, createNormalizedJsonItemDescription(item));
}

export function normalizeCollection(collection) {
  return collection.map(item => normalizeItem(item));
}
