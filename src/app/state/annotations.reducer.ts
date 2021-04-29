/* Actions */
import { ADD_ANNOTATION , REMOVE_ANNOTATION } from './annotations.actions';
/* Models */
import { IAnnotation } from '../shared/models/annotation.model';
/* Enums */
import { Annotation } from '../shared/enums/annotation.enum';

export function annotationsReducer(state: IAnnotation[] = [], action) {
  switch (action.type) {

    case ADD_ANNOTATION:

      if(action.payload.type == Annotation.LINESTRING){
        state = [action.payload, ...state.filter((annot) => { return annot.type != Annotation.LINESTRING})];
      }

      if(action.payload.type == Annotation.POLYGON){
        state = [action.payload, ...state.filter((annot) => { return annot.type != Annotation.POLYGON})];
      }

      if(action.payload.type == Annotation.POINT){
        state = [action.payload, ...state];
      }

      if(action.payload.type == Annotation.PINS){
        state = [action.payload, ...state.filter((annot) => { return annot.type != Annotation.PINS})];
      }

      if(action.payload.type == Annotation.CLUSTER){
        state = [action.payload, ...state.filter((annot) => { return annot.type != Annotation.CLUSTER})];
      }
      return state;

    case REMOVE_ANNOTATION:
      return [...state.filter((annot) => { return `${annot.id}${annot.type}` != `${action.payload.id}${action.payload.type}` })];

    default:
      return state;
  }
}
