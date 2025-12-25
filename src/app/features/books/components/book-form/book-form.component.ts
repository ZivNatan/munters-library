import { Component, computed, effect, input, output } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Book } from '../../../../core/models/book.model';

@Component({
  selector: 'app-book-form',
  standalone: true,
  imports: [ReactiveFormsModule],
  templateUrl: './book-form.component.html',
  styleUrl: './book-form.component.scss',
})
export class BookFormComponent {
  readonly book = input<Book | null>(null); // null => Add
  readonly submitForm = output<Book>();
  readonly cancel = output<void>();

  private readonly fb = new FormBuilder();

  readonly isEdit = computed(() => !!this.book());



  readonly form = this.fb.group({
    title: ['', Validators.required],
    author: ['', Validators.required],
    publicationDate: [null as number | null, [Validators.required, Validators.min(1000)]],
    description: [''],
  });

  private readonly syncEffect = effect(() => {
    const b = this.book();
    if (!b) {
      this.form.reset({
        title: '',
        author: '',
        publicationDate: null,
        description: '',
      });
      return;
    }

    this.form.reset({
      title: b.title,
      author: b.author,
      publicationDate: b.publicationDate,
      description: b.description ?? '',
    });
  });

  onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const v = this.form.getRawValue();

  const base = this.book();
  const result = base
    ? ({
        ...base, // save isCheckedOut status
        title: v.title!,
        author: v.author!,
        publicationDate: Number(v.publicationDate),
        description: v.description ?? '',
      } as const)
    : ({
        id: crypto.randomUUID(),
        title: v.title!,
        author: v.author!,
        publicationDate: Number(v.publicationDate),
        description: v.description ?? '',
        isCheckedOut: false, // Available default
      } as const);

    this.submitForm.emit(result);
  }
}
