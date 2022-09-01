import { TestBed, ComponentFixture, waitForAsync } from '@angular/core/testing';
import { Component } from '@angular/core';
import { By } from '@angular/platform-browser';

import { ColumnChangesService } from '../../services/column-changes.service';
import { DataTableColumnDirective } from './column.directive';

@Component({
  selector: 'test-fixture-component',
  template: `
    <ngx-datatable-column id="t1"></ngx-datatable-column>
    <ngx-datatable-column id="t2" [name]="columnName">
      <ng-template></ng-template>
      <ng-template></ng-template>
    </ngx-datatable-column>
  `
})
class TestFixtureComponent {
  columnName: string;
}

describe('DataTableColumnDirective', () => {
  let fixture: ComponentFixture<TestFixtureComponent>;
  let component: TestFixtureComponent;
  let element;

  // provide our implementations or mocks to the dependency injector
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [DataTableColumnDirective, TestFixtureComponent],
      providers: [
        {
          provide: ColumnChangesService,
          useValue: {
            onInputChange: jasmine.createSpy('onInputChange')
          }
        }
      ]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(
      () => {
        fixture = TestBed.createComponent(TestFixtureComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;
      },
      () => {}
    );
  }));

  describe('fixture', () => {
    let directive: DataTableColumnDirective;

    beforeEach(() => {
      directive = fixture.debugElement
        .query(By.directive(DataTableColumnDirective))
        .injector.get(DataTableColumnDirective);
    });

    it('should have a component instance', () => {
      void expect(component).toBeTruthy();
    });

    it('should have at least one DataTableColumnDirective directive', () => {
      void expect(directive).toBeTruthy();
    });
  });

  describe('directive #1', () => {
    let directive: DataTableColumnDirective;

    beforeEach(() => {
      directive = fixture.debugElement.query(By.css('#t1')).injector.get(DataTableColumnDirective);
    });

    it('should be found', () => {
      void expect(directive).toBeTruthy();
    });

    it('should have undefined inputs by default', () => {
      fixture.detectChanges();
      void expect(directive.name).toBeUndefined();
      void expect(directive.prop).toBeUndefined();
      void expect(directive.frozenRight).toBeUndefined();
      void expect(directive.frozenLeft).toBeUndefined();
      void expect(directive.flexGrow).toBeUndefined();
      void expect(directive.resizeable).toBeUndefined();
      void expect(directive.comparator).toBeUndefined();
      void expect(directive.pipe).toBeUndefined();
      void expect(directive.sortable).toBeUndefined();
      void expect(directive.draggable).toBeUndefined();
      void expect(directive.canAutoResize).toBeUndefined();
      void expect(directive.minWidth).toBeUndefined();
      void expect(directive.width).toBeUndefined();
      void expect(directive.maxWidth).toBeUndefined();
      void expect(directive.treeLevelIndent).toBeUndefined();
    });
  });

  describe('directive #2', () => {
    let directive: DataTableColumnDirective;

    beforeEach(() => {
      directive = fixture.debugElement.query(By.css('#t2')).injector.get(DataTableColumnDirective);
    });

    it('should be found', () => {
      void expect(directive).toBeTruthy();
    });

    it('should not notify of changes if its the first change', () => {
      component.columnName = 'Column A';
      fixture.detectChanges();

      void expect(TestBed.inject(ColumnChangesService).onInputChange).not.toHaveBeenCalled();
    });

    it('notifies of subsequent changes', () => {
      component.columnName = 'Column A';
      fixture.detectChanges();

      void expect(TestBed.inject(ColumnChangesService).onInputChange).not.toHaveBeenCalled();

      component.columnName = 'Column B';
      fixture.detectChanges();

      void expect(TestBed.inject(ColumnChangesService).onInputChange).toHaveBeenCalled();
    });
  });
});
