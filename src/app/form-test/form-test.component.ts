import { Component, OnInit, ViewChild, TemplateRef } from '@angular/core';
import { Subject, Observable } from 'rxjs';
import { YodaFloatRef, YodaFloatService } from 'projects/yoda-float/src/public_api';
import { YodaFormComponent, YodaFormOptions } from 'projects/yoda-form/src/public_api';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { testStates } from '../MOCK_DATA';
import { Validators } from '@angular/forms';

@Component({
  selector: 'app-form-test',
  templateUrl: './form-test.component.html',
  styleUrls: [ './form-test.component.scss' ]
})
export class FormTestComponent implements OnInit {
  @ViewChild('testTemplate') testTempRef: TemplateRef<any>;
  @ViewChild('imgTemplate') imgTempRef: TemplateRef<any>;
  @ViewChild('imgsTemplate') imgsTempRef: TemplateRef<any>;
  imgSrcs: any[] = [];
  num: number;
  imgSrc = 'http://media.pixcove.com/I/5/8/Image-Editing-Textures-Backgrounds-Unleashed-Ebv-W-8490.jpg';

  optionTestSubject = new Subject<{ value: any; text: string }[]>();
  ref: YodaFloatRef<YodaFormComponent>;
  options: YodaFormOptions;

  constructor(private yodaFloatService: YodaFloatService, private yodaFloatRef: YodaFloatRef<any>) {}

  ngOnInit() {
    this.initForm();
    this.openForm();
  }

  openForm(side?: string) {
    if (this.ref) {
      this.closeForm();
    } else {
      let index;
      if (side) {
        if (side === 'right') {
          index = 'onMyRight';
        }
        if (side === 'left') {
          index = 'onMyLeft';
        }
      }
      this.ref = this.yodaFloatService.addComponent(YodaFormComponent, {
        index: index,
        callerRef: this.yodaFloatRef
      });
      this.ref.instance.setOptions(this.options);
    }
  }

  closeForm() {
    if (this.ref) {
      this.ref.destroy();
      this.ref = null;
    }
  }

  initForm() {
    this.options = {
      title: '테스트 폼',
      fields: [
        {
          title: '담당자 선택',
          name: '',
          type: 'subtitle'
        },
        {
          type: 'template',
          template: this.testTempRef
        },
        {
          type: 'row',
          columns: [
            {
              title: 'Radio Test',
              name: 'radiotest',
              type: 'radio-h',
              options: [
                {
                  value: 'one',
                  text: '1-One',
                  disabled: false
                },
                {
                  value: 'two',
                  text: '2-Two',
                  disabled: false
                },
                {
                  value: 'three',
                  text: '3-Three',
                  disabled: false
                },
                {
                  value: 'disabled',
                  text: '4-disabled',
                  disabled: true
                }
              ]
            },
            {
              title: 'Checkbox',
              type: 'checkbox',
              name: 'checkboxTest'
            }
          ]
        },
        {
          type: 'row',
          columns: [
            {
              title: '담당자',
              name: 'staff.[0]',
              type: 'typeahead',
              onTypeahead: (text$: Observable<string>) =>
                text$.pipe(
                  debounceTime(200),
                  distinctUntilChanged(),
                  map(
                    (term) =>
                      term.length < 2
                        ? []
                        : testStates.filter((v) => v.toLowerCase().indexOf(term.toLowerCase()) > -1).slice(0, 10)
                  )
                ),
              required: true,
              appendButton: {
                title: 'Add',
                color: 'primary',
                onClick: () => {
                  this.ref.instance.setFocus('staff.[3]');
                }
              }
            },
            {
              title: '담당일자',
              name: 'staff.[1]',
              value: new Date('2013-03-01'),
              type: 'date',
              required: true
            },
            {
              title: '<i class="far fa-plus"></i> 추가',
              name: 'addButton',
              type: 'button',
              color: 'primary',
              onClick: () => {}
            }
          ]
        },
        {
          type: 'template',
          template: this.imgsTempRef
        },
        {
          type: 'file-multiple',
          name: 'imgName',
          title: 'Image URL',
          onValueChanged: (value: FileList) => {
            if (value && value.length > 0) {
              for (let i = 0; i < value.length; i++) {
                const val = value[i];
                const reader = new FileReader();
                reader.readAsDataURL(val);
                reader.onload = () => {
                  this.imgSrcs.push(reader.result);
                };
              }
            }
          }
        },
        {
          title: '담당금액',
          name: 'staff.[3]',
          type: 'decimal',
          placeholder: '숫자입력',
          required: true,
          onValueChanged: (value: number) => {
            this.num = value;
            this.ref.instance.refreshState();
          },
          appendButton: {
            title: '<i class="fas fa-trash"></i>',
            color: 'danger',
            onState: (_) => (this.num > 100000 ? 'enabled' : 'hide'),
            onClick: () => {}
          }
        },
        {
          title: '<i class="far fa-plus"></i> 추가',
          name: 'addButton',
          type: 'button',
          color: 'success',
          onClick: () => {},
          onState: (_) => (this.num > 100000 ? 'enabled' : 'disabled')
        },

        {
          title: '비고',
          name: 'staff.[4]',
          type: 'text',
          value: 'test'
        },
        {
          title: 'Select 테스트',
          name: '',
          type: 'subtitle'
        },
        {
          type: 'row',
          columns: [
            {
              title: '사유(5글자이상)',
              name: 'staff.[5]',
              type: 'text',
              required: true,
              validators: [ Validators.minLength(5) ],
              width: 'col-5'
            },
            {
              title: '입고예정일',
              name: 'staff.[2]',
              value: new Date('2019-01-01'),
              type: 'date',
              width: 'col-5'
            },
            {
              title: 'test select',
              name: 'staff.[6]',
              type: 'select',
              value: '3',
              asyncOptions: this.optionTestSubject
            }
          ]
        }
      ],
      onValueChanged: (value) => {
        console.log(value);
      },
      onAction: (action: string, data: any) => {
        console.log(data);
        this.ref.destroy();
        this.ref = null;
      }
    };
    console.log('form inited');
    // setTimeout(() => {

    // }, 100);
  }

  subjectTest() {
    setTimeout(() => {
      this.optionTestSubject.next([
        {
          value: '0',
          text: 'zero'
        },
        {
          value: '1',
          text: 'one'
        },
        {
          value: '2',
          text: 'two'
        },
        {
          value: '3',
          text: 'three'
        },
        {
          value: '4',
          text: 'four'
        },
        {
          value: '5',
          text: 'five'
        }
      ]);
    }, 5000);

    setTimeout(() => {
      this.optionTestSubject.next([
        {
          value: '0',
          text: 'zero 0'
        },
        {
          value: '1',
          text: 'one 1'
        },
        {
          value: '2',
          text: 'two 2'
        },
        {
          value: '3',
          text: 'three 3'
        },
        {
          value: '4',
          text: 'four 4'
        },
        {
          value: '5',
          text: 'five 5'
        }
      ]);
    }, 8000);
  }
}
