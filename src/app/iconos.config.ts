import { addIcons } from 'ionicons';
import {
  add,
  closeCircle,
  trash,
  create,
  book,
  person,
  settings,
  home,
  libraryOutline,
  constructOutline,
  swapHorizontal,
  receiptOutline,
  personCircleOutline,
  homeOutline,
  logOutOutline,
} from 'ionicons/icons';

export const registrarIconos = () => {
  addIcons({
    // dashboard
    homeOutline,
    libraryOutline,
    constructOutline,
    swapHorizontal,
    receiptOutline,
    personCircleOutline,
    settings,
    logOutOutline,
    //
    home,
    add,
    closeCircle,
    //
    trash,
    create,
    //
    book,
    person,
  });
};
