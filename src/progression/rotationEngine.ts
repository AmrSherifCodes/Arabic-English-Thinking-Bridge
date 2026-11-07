import { ProgressionState } from './types';

export interface ThemeRotation {
  id: string;
  title: string;
  reasonWhy: string;
}

export function getCurrentTheme(state: ProgressionState): ThemeRotation {
  const day = new Date().getDay(); // 0 = Sunday, 1 = Monday, etc.

  if (day === 0 || day === 6) { // Saturday, Sunday
    return {
      id: 'conversation',
      title: 'الطلاقة اليومية والمحادثة',
      reasonWhy: 'نهاية الأسبوع مخصصة للاندماج الطبيعي.'
    };
  } else if (day === 1 || day === 2) { // Monday, Tuesday
    return {
      id: 'business',
      title: 'العربية المهنية ورجال الأعمال',
      reasonWhy: 'التركيز على لغة العمل في بداية الأسبوع.'
    };
  } else if (day === 3 || day === 4) { // Wednesday, Thursday
    return {
      id: 'idioms',
      title: 'التعبيرات الاصطلاحية وأدوات الربط',
      reasonWhy: 'بناء جسور التفكير لتبدو كمتحدث أصلي.'
    };
  } else { // Friday
    return {
      id: 'srs',
      title: 'المراجعة الذكية وسد الفجوات',
      reasonWhy: 'يوم الجمعة لترسيخ ما تعلمته طوال الأسبوع.'
    };
  }
}
