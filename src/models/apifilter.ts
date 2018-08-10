
export class ApiFilter {
    private filters: Array<string> = [];

    public filterString(): string {
      // Build a '?name1=val1&name2=val2' string
      if (this.filters.length) {
        let dataFilter: string = '?' + this.filters.join('&');
        return dataFilter;
      }
      return '';
    }

    public addFilter(name: string, value: string, unique: boolean = false): void {
      let arg: string = name + '=' + value;
      if (unique) {
        this.removeFilter(name);
      }
      this.filters.push(arg);
    }

    public removeFilter(name: string): void {
      let arg: string = name + '=';
      this.filters = this.filters.filter(item =>
        item.indexOf(arg) !== 0
      );
    }

    // nb: if there are duplicate values for a key, returns the first
    public getFilter(name: string): string | undefined {
      let value;

      for (let filter of this.filters){
        let [key, val] = filter.split('=');
          if (key == name){
            value =  val;
            break;
          }
      }
      return value;
    }
  }