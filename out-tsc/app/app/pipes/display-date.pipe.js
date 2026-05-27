import { Pipe } from '@angular/core';
import { DatePipe } from '@angular/common';
import * as i0 from "@angular/core";
export class DisplayDatePipe {
    datePipe = new DatePipe('en-GB');
    transform(value) {
        if (value == null || value === '') {
            return '—';
        }
        return this.datePipe.transform(value, 'd MMM y, HH:mm') ?? '—';
    }
    static ɵfac = function DisplayDatePipe_Factory(__ngFactoryType__) { return new (__ngFactoryType__ || DisplayDatePipe)(); };
    static ɵpipe = /*@__PURE__*/ i0.ɵɵdefinePipe({ name: "displayDate", type: DisplayDatePipe, pure: true });
}
(() => { (typeof ngDevMode === "undefined" || ngDevMode) && i0.ɵsetClassMetadata(DisplayDatePipe, [{
        type: Pipe,
        args: [{
                name: 'displayDate',
                standalone: true
            }]
    }], null, null); })();
