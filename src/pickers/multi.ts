import { Directive, Input, OnChanges, Optional, SimpleChanges } from '@angular/core';

import { DayDate, isSameDay } from '../utils/utils';
import { DateConstraint } from '../validator/directives';
import { DatePicker, EmitOptions, pickerProviders } from './base';

@Directive({
  selector: '[multiPicker]',
  exportAs: 'picker, multiPicker',
  providers: pickerProviders(MultiPicker)
})
export class MultiPicker extends DatePicker<DayDate[]> implements OnChanges {

  private _limit = Infinity;

  @Input('multiPicker')
  get limit() {
    return this._limit;
  }

  set limit(limit: number) {
    this._limit = limit;
  }

  constructor(@Optional() dateConstraint: DateConstraint) {
    super([], dateConstraint);
  }

  public setDate(date: DayDate, index: number, options?: EmitOptions) {
    if (this.value[index] !== date) {
      this.setValue([
        ...this.value.slice(0, index),
        date,
        ...this.value.slice(index + 1),
      ], options);
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    let value = this.value;

    if ('limit' in changes && value.length > this.limit) {
      this.setValue(value.slice(0, this.limit));
    }
  }

  protected filterValue(predicate: (date: DayDate) => boolean) {
    const newValue = this.value.filter(predicate);

    if (newValue.length !== this.value.length) {
      this.setValue(newValue);
      return true;
    }

    return false;
  }

  protected updateValidity() {
    this.filterValue(d => this.isValid(d));
  }

  protected add(date: DayDate): boolean {
    if (this.isComplete()) {
      return false;
    }

    this.setValue([...this.value, date]);
    return true;
  }

  protected remove(date: DayDate): boolean {
    return this.filterValue(d => !isSameDay(d, date));
  }

  public isPicked(date: DayDate) {
    return this.value.some(d => isSameDay(d, date));
  }

  isComplete(): boolean {
    return this.value && this.value.length == this.limit;
  }
}
