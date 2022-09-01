import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { DebugElement, PipeTransform } from '@angular/core';
import { By } from '@angular/platform-browser';

import { DataTableBodyRowComponent } from '../body-row.component';
import { DataTableBodyCellComponent } from '../body-cell.component';
import { DataTableSummaryRowComponent, ISummaryColumn } from './summary-row.component';
import { ScrollbarHelper } from '../../../services/scrollbar-helper.service';
import { setColumnDefaults } from '../../../utils/column-helper';

describe('DataTableSummaryRowComponent', () => {
  let fixture: ComponentFixture<DataTableSummaryRowComponent>;
  let component: DataTableSummaryRowComponent;
  let element: DebugElement;

  let rows: any[];
  let columns: ISummaryColumn[];

  beforeEach(() => {
    rows = [
      { col1: 10, col2: 20 },
      { col1: 1, col2: 30 }
    ];
    columns = [{ prop: 'col1' }, { prop: 'col2' }];
    setColumnDefaults(columns);
  });

  beforeEach(waitForAsync(() => {
    void TestBed.configureTestingModule({
      declarations: [DataTableSummaryRowComponent, DataTableBodyRowComponent, DataTableBodyCellComponent],
      providers: [ScrollbarHelper]
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DataTableSummaryRowComponent);
    component = fixture.componentInstance;
    element = fixture.debugElement;
    fixture.detectChanges();
  });

  function triggerChange() {
    component.ngOnChanges();
    fixture.detectChanges();
  }

  describe('fixture', () => {
    it('should have a component instance', () => {
      void expect(component).toBeTruthy();
    });
  });

  describe('Visibility', () => {
    it('should not be visible when there are no columns', () => {
      component.rows = rows;
      triggerChange();
      void expect(element.query(By.css('datatable-body-row'))).toBeNull();
    });

    it('should not be visible when there are no rows', () => {
      component.columns = columns;
      triggerChange();
      void expect(element.query(By.css('datatable-body-row'))).toBeNull();
    });

    it('should be visible when there are rows and columns', () => {
      component.columns = columns;
      component.rows = rows;
      triggerChange();
      void expect(element.query(By.css('datatable-body-row'))).not.toBeNull();
    });
  });

  describe('Computing', () => {
    beforeEach(() => {
      component.columns = columns;
      component.rows = rows;
      triggerChange();
    });

    describe('Default Summary Function', () => {
      it('should be used when no other provided', () => {
        void expect(component.summaryRow.col1).toEqual(rows[0].col1 + rows[1].col1);
        void expect(component.summaryRow.col2).toEqual(rows[0].col2 + rows[1].col2);
      });

      it('should works with empty row', () => {
        component.rows = [{ col1: null, col2: undefined }, { col1: null }];

        triggerChange();

        void expect(component.summaryRow.col1).toBeNull();
        void expect(component.summaryRow.col2).toBeNull();
      });

      it('should not compute a result if there are non-number cells', () => {
        component.rows = [
          { col1: 'aaa', col2: 'xxx' },
          { col1: 'bbb', col2: 34 }
        ];

        triggerChange();
        void expect(component.summaryRow.col1).toEqual(null);
        void expect(component.summaryRow.col2).toEqual(null);
      });
    });

    it('should not compute if null is set as a summary function', () => {
      columns[0].summaryFunc = null;

      triggerChange();

      void expect(component.summaryRow.col1).toEqual(null);
    });

    it('should use provided summary function', () => {
      const sum1 = 22;
      const sum2 = 'test sum';
      const spy1 = jasmine.createSpy('spy1').and.returnValue(sum1);
      const spy2 = jasmine.createSpy('spy2').and.returnValue(sum2);
      columns[0].summaryFunc = spy1;
      columns[1].summaryFunc = spy2;

      triggerChange();

      void expect(spy1.calls.any()).toBeTruthy();
      void expect(spy2.calls.any()).toBeTruthy();

      void expect(spy1.calls.mostRecent().args[0]).toEqual([rows[0].col1, rows[1].col1]);
      void expect(spy2.calls.mostRecent().args[0]).toEqual([rows[0].col2, rows[1].col2]);

      void expect(component.summaryRow.col1).toEqual(sum1);
      void expect(component.summaryRow.col2).toEqual(sum2);
    });

    describe('Pipe', () => {
      it('should use provided pipe', () => {
        const transformed = '$22';
        const transformSpy = jasmine.createSpy('transform').and.returnValue(transformed);

        columns[0].pipe = { transform: transformSpy };
        triggerChange();

        void expect(transformSpy.calls.any()).toBeTruthy();
        void expect(component.summaryRow.col1).toEqual(transformed);
      });
    });
  });
});
