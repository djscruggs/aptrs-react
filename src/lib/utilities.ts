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
  if (name.trim() === '') {
    return '?'; // Return '?' for an empty string
  }
  const nameParts = name.split(' ').filter(part => part !== ''); // Split the name into parts and remove empty parts
  const initials = nameParts.map(part => part.charAt(0)).join(''); // Get the first character of each part

  return initials.toUpperCase(); // Convert initials to uppercase and return
}