import { ComponentFixture, TestBed, waitForAsync } from '@angular/core/testing';
import { Component, ElementRef } from '@angular/core';
import { By } from '@angular/platform-browser';

import { OrderableDirective } from './orderable.directive';
import { DraggableDirective } from './draggable.directive';
import { id } from '../utils/id';

@Component({
  selector: 'test-fixture-component',
  template: ` <div orderable></div> `
})
class TestFixtureComponent {}

describe('OrderableDirective', () => {
  let fixture: ComponentFixture<TestFixtureComponent>;
  let component: TestFixtureComponent;
  let element;

  // provide our implementations or mocks to the dependency injector
  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [OrderableDirective, TestFixtureComponent]
    });
  });

  beforeEach(waitForAsync(() => {
    TestBed.compileComponents().then(
      () => {
        fixture = TestBed.createComponent(TestFixtureComponent);
        component = fixture.componentInstance;
        element = fixture.nativeElement;

        /* This is required in order to resolve the `ContentChildren`.
         *  If we don't go through at least on change detection cycle
         *  the `draggables` will be `undefined` and `ngOnDestroy` will
         *  fail.
         */
        fixture.detectChanges();
      },
      () => {}
    );
  }));

  describe('fixture', () => {
    let directive: OrderableDirective;

    beforeEach(() => {
      directive = fixture.debugElement.query(By.directive(OrderableDirective)).injector.get(OrderableDirective);
    });

    it('should have a component instance', () => {
      void expect(component).toBeTruthy();
    });

    it('should have OrderableDirective directive', () => {
      void expect(directive).toBeTruthy();
    });

    describe('when a draggable is removed', () => {
      function checkAllSubscriptionsForActiveObservers() {
        const subs = directive.draggables.map(d => {
          void expect(d.dragEnd.isStopped).toBe(false);
          void expect(d.dragStart.isStopped).toBe(false);

          return {
            dragStart: d.dragStart.observers,
            dragEnd: d.dragEnd.observers
          };
        });

        subs.forEach(sub => {
          void expect(sub.dragStart.length).toBe(1);
          void expect(sub.dragEnd.length).toBe(1);
        });
      }

      function newDraggable() {
        // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
        const draggable = new DraggableDirective(<ElementRef>{});

        // used for the KeyValueDiffer
        draggable.dragModel = {
          $$id: id()
        };

        return draggable;
      }

      let draggables: DraggableDirective[];

      beforeEach(() => {
        draggables = [newDraggable(), newDraggable(), newDraggable()];

        directive.draggables.reset(draggables);

        directive.updateSubscriptions();

        checkAllSubscriptionsForActiveObservers();
      });

      it('then dragStart and dragEnd are unsubscribed from the removed draggable', () => {
        const unsubbed = draggables.splice(0, 1)[0];

        void expect(unsubbed.dragStart.isStopped).toBe(false);
        void expect(unsubbed.dragEnd.isStopped).toBe(false);

        directive.draggables.reset(draggables);

        directive.updateSubscriptions();

        checkAllSubscriptionsForActiveObservers();

        void expect(unsubbed.dragStart.isStopped).toBe(true);
        void expect(unsubbed.dragEnd.isStopped).toBe(true);
      });
    });
  });
});
