type ObjectWithProperty = {
  [key: string]: string | number | boolean; // Define the types of properties you expect
};
export function sortByPropertyName<T extends ObjectWithProperty>(arr: T[], variableName: keyof T): T[] {
  return arr.sort((a, b) => {
    const propertyA = String(a[variableName]).toUpperCase(); // Accessing the specified property dynamically
    const propertyB = String(b[variableName]).toUpperCase();

    if (propertyA < propertyB) {
      return -1; // propertyA comes before propertyB
    }
    if (propertyA > propertyB) {
      return 1; // propertyA comes after propertyB
    }
    return 0; // properties are equal
  });
}

export function getInitials(name: string): string {
  if (!name || name.trim() === '') {
    return '?'; // Return '?' for an empty string
  }
  const nameParts = name.split(' ').filter(part => part !== ''); // Split the name into parts and remove empty parts
  const initials = nameParts.map(part => part.charAt(0)).join(''); // Get the first character of each part

  return initials.toUpperCase(); // Convert initials to uppercase and return
}

export const phoneRegex = /\+(9[976]\d|8[987530]\d|6[987]\d|5[90]\d|42\d|3[875]\d|2[98654321]\d|9[8543210]|8[6421]|6[6543210]|5[87654321]|4[987654310]|3[9643210]|2[70]|7|1)\d{1,14}$/
export const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const usernameRegex = /^[a-zA-Z0-9]{1,12}$/
export const passwordRegex = /^(?=.*[A-Z])(?=.*[@#$%!^&*]).{10,}$/;

export const CK_allowedTags = ['strong', 'em', 's', 'u', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'ol', 'ul', 'li', 'img', 'a', 'span','code', 'blockquote', 'div', 'font', 'table', 'tr', 'td', 'th','pre']
// export const CK_toolbarItems = [
//   'bold', 'italic', 'strikethrough', 'underline', '|', 'heading', '|', 'numberedList', 'bulletedList', 'listItem', '|', 'imageInsert', 'link', 'span', 'code', 'blockquote', 'div', 'font', 'table', 'tableColumn', 'tableRow', 'tableCell', 'pre'
// ];
export const CK_toolbarItems = {items: [
  'undo', 'redo', '|', 'bold', 'italic', 'strikethrough', 'underline', '|', 'heading', '|', 'numberedList', 'bulletedList', 'listItem', '|', 'imageInsert', 'link', 'span', 'code', 'blockquote', 'div', 'font', 'pre'
]};

export const parseErrors = (error: any): any => {
  if (error?.request?.response) {
    const errors = JSON.parse(error?.request?.response);
    let transformed:any = {}
    Object.entries(errors).map((item, index) => {
      transformed[item[0]] = item[1][0]
    })
    return transformed;
  }
  return error;
}